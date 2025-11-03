# TOTP Token Generator

A full-stack web application for generating Time-based One-Time Password (TOTP) tokens with user management and admin controls.

## Features

- **User Registration & Authentication**: Secure user signup with admin approval workflow
- **Admin Dashboard**: Complete administrative controls for user management and token monitoring
- **TOTP Token Generation**: Generate secure TOTP tokens with configurable bit sizes (128-1024 bits)
- **Token Logging**: Comprehensive logging of all token generation activities
- **Role-based Access**: Separate interfaces for users and administrators
- **MongoDB Integration**: Cloud-ready database with MongoDB Atlas support

## Tech Stack

### Frontend
- React 18 with Hooks
- React Router for navigation
- Tailwind CSS for styling
- Shadcn/ui component library
- Axios for API calls

### Backend
- FastAPI (Python web framework)
- MongoDB with Motor (async driver)
- PyOTP for TOTP generation
- Bcrypt for password hashing
- Pydantic for data validation

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd totp-token-generator
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   - Copy `backend/.env` and update MongoDB connection string
   - Update `frontend/.env` with backend URL

5. **Start Services**
   ```bash
   # Backend (Terminal 1)
   cd backend
   python -m uvicorn server:app --host 0.0.0.0 --port 8000

   # Frontend (Terminal 2)
   cd frontend
   npm start
   ```

6. **Initialize Super Admin**
   ```bash
   POST http://localhost:8000/api/init-super-admin
   ```

## Default Credentials

**Super Admin:**
- Username: `superadmin`
- Email: `superadmin@totp.com`
- Password: `SuperAdmin@2025`
- Admin Access Password: `ADMIN_ACCESS_2025`

## API Endpoints

### User Endpoints
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `POST /api/user/generate-token` - Generate TOTP token

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/pending-registrations` - View pending users
- `POST /api/admin/approve-user/{id}` - Approve user registration
- `GET /api/admin/token-logs` - View token generation logs
- `GET /api/admin/users` - View all users

## Deployment

### Backend Deployment (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Frontend Deployment (Netlify)
1. Build command: `npm run build`
2. Publish directory: `build`
3. Set environment variables for API URL

### Database (MongoDB Atlas)
1. Create Atlas cluster
2. Get connection string
3. Update environment variables

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb+srv://...
DB_NAME=totp_database
CORS_ORIGINS=https://your-frontend-domain.com
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security Notes

- Change default admin credentials in production
- Use HTTPS in production
- Regularly update dependencies
- Monitor token generation logs
- Implement rate limiting for API endpoints
