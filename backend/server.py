from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import pyotp
import bcrypt
import time
import secrets
from hashlib import sha256
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb+srv://aldringorit2008_db_user:AJhay2008@cluster0.tk860ik.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

# Motor handles TLS automatically when using mongodb+srv://
client = AsyncIOMotorClient(mongo_url)

db = client[os.environ.get('DB_NAME', 'totp_database')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

class TOTPModel:
    @staticmethod
    def generate_secret_from_password_hash(password_hash: str) -> str:
        # Use the encrypted password hash as seed for TOTP secret
        # Extract the ciphertext part (first part before first colon)
        ciphertext = password_hash.split(':')[0]

        # Hash the ciphertext to create a deterministic secret
        secret_hash = sha256(ciphertext.encode()).digest()

        # Convert to base32 for TOTP
        secret_b32 = base64.b32encode(secret_hash).decode('utf-8').rstrip('=')

        # Ensure it's at least 32 characters (160 bits)
        while len(secret_b32) < 32:
            secret_b32 += secret_b32

        return secret_b32[:32]

    @staticmethod
    def generate_secret(bit_size: int = 128) -> str:
        byte_size = bit_size // 8
        return pyotp.random_base32(length=byte_size)

    @staticmethod
    def generate_token(secret: str) -> str:
        totp = pyotp.TOTP(secret)
        return totp.now()

    @staticmethod
    def verify_token(secret: str, token: str) -> bool:
        totp = pyotp.TOTP(secret)
        return totp.verify(token)

    @staticmethod
    def get_remaining_time() -> int:
        return 30 - (int(time.time()) % 30)

    @staticmethod
    def measure_computation_time(bit_size: int) -> tuple:
        start_time = time.time()
        secret = TOTPModel.generate_secret(bit_size)
        end_time = time.time()
        computation_time = (end_time - start_time) * 1000
        return secret, computation_time

class PasswordHasher:
    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Pydantic Models

class UserRegistration(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    username: str
    email: EmailStr
    password: str
    admin_access_password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    role: str  # "super_admin" or "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    secret_key: str
    bit_size: int
    computation_time: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "active"  # "active" or "deleted"

class PendingRegistration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PendingAdminRegistration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    requested_role: str  # "admin" or "super_admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# API Routes

# User registration
@api_router.post("/user/register")
async def register_user(user: UserRegistration):
    # Check if user already exists
    existing_user = await db.users.find_one({
        "$or": [
            {"username": user.username},
            {"email": user.email}
        ]
    })

    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    # Check pending registrations
    existing_pending = await db.pending_registrations.find_one({
        "$or": [
            {"username": user.username},
            {"email": user.email}
        ]
    })

    if existing_pending:
        raise HTTPException(status_code=400, detail="Registration already pending approval")

    # Create pending registration
    password_hash = PasswordHasher.hash_password(user.password)
    pending_reg = PendingRegistration(
        username=user.username,
        email=user.email,
        password_hash=password_hash
    )

    await db.pending_registrations.insert_one(pending_reg.model_dump())

    return {"message": "Registration submitted. Awaiting admin approval."}

# User login
@api_router.post("/user/login")
async def login_user(login: UserLogin):
    user = await db.users.find_one({
        "username": login.username,
        "email": login.email
    })

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not PasswordHasher.verify_password(login.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get('approved', False):
        raise HTTPException(status_code=403, detail="Account not approved yet")

    return {
        "user_id": user['id'],
        "username": user['username'],
        "email": user['email'],
        "role": "user"
    }

# Generate TOTP token for user
@api_router.post("/user/generate-token")
async def generate_user_token(data: dict):
    user_id = data.get('user_id')
    bit_size = data.get('bit_size', 1024)

    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate new secret and token
    secret, computation_time = TOTPModel.measure_computation_time(bit_size)
    token = TOTPModel.generate_token(secret)
    remaining_time = TOTPModel.get_remaining_time()

    # Log the token generation
    token_log = TokenLog(
        user_id=user['id'],
        username=user['username'],
        secret_key=secret,
        bit_size=bit_size,
        computation_time=computation_time
    )

    await db.token_logs.insert_one(token_log.model_dump())

    return {
        "token": token,
        "remaining_time": remaining_time,
        "secret": secret
    }

# Admin login
@api_router.post("/admin/login")
async def login_admin(login: AdminLogin):
    admin = await db.admins.find_one({
        "username": login.username,
        "email": login.email
    })

    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not PasswordHasher.verify_password(login.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify admin access password
    if login.admin_access_password != "ADMIN_ACCESS_2025":
        raise HTTPException(status_code=401, detail="Invalid admin access password")

    return {
        "user_id": admin['id'],
        "username": admin['username'],
        "email": admin['email'],
        "role": admin['role']
    }

# Get all token logs (Admin)
@api_router.get("/admin/token-logs")
async def get_token_logs():
    logs = []
    async for log in db.token_logs.find().sort("created_at", -1):
        log_data = {k: v for k, v in log.items()}
        if '_id' in log_data:
            log_data['id'] = str(log_data.pop('_id'))
        logs.append(log_data)

    return logs

# Delete token (Admin)
@api_router.delete("/admin/token/{token_id}")
async def delete_token(token_id: str):
    result = await db.token_logs.update_one(
        {"id": token_id},
        {"$set": {"status": "deleted"}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Token not found")

    return {"message": "Token deleted successfully"}

# Regenerate token with specific bit size (Admin)
@api_router.post("/admin/regenerate-token")
async def regenerate_token(data: dict):
    user_id = data.get('user_id')
    bit_size = data.get('bit_size')

    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate new secret and token
    secret, computation_time = TOTPModel.measure_computation_time(bit_size)

    # Log the token generation
    token_log = TokenLog(
        user_id=user['id'],
        username=user['username'],
        secret_key=secret,
        bit_size=bit_size,
        computation_time=computation_time
    )

    await db.token_logs.insert_one(token_log.model_dump())

    return {"message": "Token regenerated successfully", "computation_time": computation_time}

# Get pending registrations (Admin)
@api_router.get("/admin/pending-registrations")
async def get_pending_registrations():
    pending = []
    async for reg in db.pending_registrations.find().sort("created_at", -1):
        reg_data = {k: v for k, v in reg.items()}
        if '_id' in reg_data:
            reg_data['id'] = str(reg_data.pop('_id'))
        pending.append(reg_data)

    return pending

# Approve user registration (Admin)
@api_router.post("/admin/approve-user/{registration_id}")
async def approve_user(registration_id: str):
    pending = await db.pending_registrations.find_one({"id": registration_id})
    if not pending:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Create approved user
    user = User(
        username=pending['username'],
        email=pending['email'],
        password_hash=pending['password_hash'],
        approved=True
    )

    await db.users.insert_one(user.model_dump())

    # Remove from pending
    await db.pending_registrations.delete_one({"id": registration_id})

    return {"message": "User approved successfully"}

# Reject user registration (Admin)
@api_router.delete("/admin/reject-user/{registration_id}")
async def reject_user(registration_id: str):
    result = await db.pending_registrations.delete_one({"id": registration_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")

    return {"message": "Registration rejected"}

# Get all users (Admin)
@api_router.get("/admin/users")
async def get_all_users():
    users = []
    async for user in db.users.find().sort("created_at", -1):
        # Remove password hash from response
        user_data = {k: v for k, v in user.items() if k != 'password_hash'}
        if '_id' in user_data:
            user_data['id'] = str(user_data.pop('_id'))
        users.append(user_data)

    return users

# Create admin (Super Admin only)
@api_router.post("/admin/create-admin")
async def create_admin(data: dict):
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    creator_role = data.get('creator_role')

    # Only super admin can create admins
    if creator_role != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can create admin accounts")

    # Check if admin exists
    existing_admin = await db.admins.find_one({
        "$or": [
            {"username": username},
            {"email": email}
        ]
    })

    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")

    password_hash = PasswordHasher.hash_password(password)
    admin = Admin(
        username=username,
        email=email,
        password_hash=password_hash,
        role=role
    )

    await db.admins.insert_one(admin.model_dump())

    return {"message": "Admin created successfully"}

# Admin registration
@api_router.post("/admin/register")
async def register_admin(data: dict):
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    requested_role = data.get('requested_role', 'admin')

    # Check if admin already exists
    existing_admin = await db.admins.find_one({
        "$or": [
            {"username": username},
            {"email": email}
        ]
    })

    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin username or email already exists")

    # Check pending admin registrations
    existing_pending = await db.pending_admin_registrations.find_one({
        "$or": [
            {"username": username},
            {"email": email}
        ]
    })

    if existing_pending:
        raise HTTPException(status_code=400, detail="Admin registration already pending approval")

    # Validate requested role
    if requested_role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'super_admin'")

    # Create pending admin registration
    password_hash = PasswordHasher.hash_password(password)
    pending_admin = PendingAdminRegistration(
        username=username,
        email=email,
        password_hash=password_hash,
        requested_role=requested_role
    )

    await db.pending_admin_registrations.insert_one(pending_admin.model_dump())

    return {"message": "Admin registration submitted. Awaiting super admin approval."}

# Get pending admin registrations (Super Admin only)
@api_router.get("/admin/pending-admin-registrations")
async def get_pending_admin_registrations():
    pending = []
    async for reg in db.pending_admin_registrations.find().sort("created_at", -1):
        reg_data = {k: v for k, v in reg.items()}
        if '_id' in reg_data:
            reg_data['id'] = str(reg_data.pop('_id'))
        pending.append(reg_data)

    return pending

# Approve admin registration (Super Admin only)
@api_router.post("/admin/approve-admin/{registration_id}")
async def approve_admin(registration_id: str, data: dict):
    approver_role = data.get('approver_role')

    if approver_role != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can approve admin registrations")

    pending = await db.pending_admin_registrations.find_one({"id": registration_id})
    if not pending:
        raise HTTPException(status_code=404, detail="Admin registration not found")

    # Create approved admin
    admin = Admin(
        username=pending['username'],
        email=pending['email'],
        password_hash=pending['password_hash'],
        role=pending['requested_role']
    )

    await db.admins.insert_one(admin.model_dump())

    # Remove from pending
    await db.pending_admin_registrations.delete_one({"id": registration_id})

    return {"message": "Admin approved successfully"}

# Reject admin registration (Super Admin only)
@api_router.delete("/admin/reject-admin/{registration_id}")
async def reject_admin(registration_id: str, data: dict):
    approver_role = data.get('approver_role')

    if approver_role != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can reject admin registrations")

    result = await db.pending_admin_registrations.delete_one({"id": registration_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin registration not found")

    return {"message": "Admin registration rejected"}

# Initialize first super admin
@api_router.post("/init-super-admin")
async def init_super_admin():
    # Check if any admin exists
    existing_admin = await db.admins.find_one({})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Super admin already exists")

    # Create default super admin
    password_hash = PasswordHasher.hash_password("SuperAdmin@2025")
    admin = Admin(
        username="superadmin",
        email="superadmin@totp.com",
        password_hash=password_hash,
        role="super_admin"
    )

    await db.admins.insert_one(admin.model_dump())

    return {
        "message": "Super admin created",
        "username": "superadmin",
        "email": "superadmin@totp.com",
        "password": "SuperAdmin@2025",
        "admin_access_password": "ADMIN_ACCESS_2025"
    }

# Verify PIN code
@api_router.post("/verify-pin")
async def verify_pin(data: dict):
    secret = data.get('secret')
    pin = data.get('pin')

    if not secret or not pin:
        raise HTTPException(status_code=400, detail="Secret and PIN are required")

    is_valid = TOTPModel.verify_token(secret, pin)

    return {
        "valid": is_valid,
        "message": "PIN verified successfully" if is_valid else "Invalid PIN"
    }

# Root route
@app.get("/")
async def root():
    return {"message": "TOTP Dashboard API", "version": "1.0.0", "docs": "/docs"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
