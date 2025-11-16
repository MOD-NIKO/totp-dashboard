import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import HomePage from "./pages/HomePage";
import UserLoginPage from "./pages/UserLoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserRegisterPage from "./pages/UserRegisterPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://your-render-backend-url.onrender.com";
export const API = `${BACKEND_URL}/api`;

export const axiosInstance = axios.create({
  baseURL: API,
});

function App() {
  const [session, setSession] = useState(null);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user/register" element={<UserRegisterPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route 
            path="/user/login" 
            element={<UserLoginPage setSession={setSession} />} 
          />
          <Route 
            path="/admin/login" 
            element={<AdminLoginPage setSession={setSession} />} 
          />
          <Route 
            path="/user/dashboard" 
            element={
              session?.role === "user" ? 
                <UserDashboard session={session} setSession={setSession} /> : 
                <Navigate to="/user/login" />
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              session?.role === "admin" || session?.role === "super_admin" ? 
                <AdminDashboard session={session} setSession={setSession} /> : 
                <Navigate to="/admin/login" />
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;