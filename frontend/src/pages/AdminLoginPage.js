import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { axiosInstance } from "../App";
import { toast } from "sonner";
import { ArrowLeft, Shield } from "lucide-react";

const AdminLoginPage = ({ setSession }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    admin_access_password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post("/admin/login", formData);
      setSession(response.data);
      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMzJhM2QiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <div className="relative z-10 w-full max-w-md">
        <Button
          data-testid="back-to-home-btn"
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-4 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-6 mx-auto">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 text-white" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
            Admin Login
          </h1>
          <p className="text-center text-slate-400 mb-8 text-sm">
            Secure access to administrative dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-slate-300 mb-2 block">Username</Label>
              <Input
                data-testid="admin-username-input"
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="bg-slate-900/50 border-slate-600 text-white focus:border-purple-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-300 mb-2 block">Email</Label>
              <Input
                data-testid="admin-email-input"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-slate-900/50 border-slate-600 text-white focus:border-purple-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300 mb-2 block">Account Password</Label>
              <Input
                data-testid="admin-password-input"
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-slate-900/50 border-slate-600 text-white focus:border-purple-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="admin_access_password" className="text-slate-300 mb-2 block">Admin Access Password</Label>
              <Input
                data-testid="admin-access-password-input"
                id="admin_access_password"
                type="password"
                value={formData.admin_access_password}
                onChange={(e) => setFormData({...formData, admin_access_password: e.target.value})}
                className="bg-slate-900/50 border-slate-600 text-white focus:border-purple-500"
                required
              />
            </div>

            <Button
              data-testid="admin-login-submit-btn"
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg mt-6"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Admin Login"}
            </Button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Don't have an admin account?{" "}
            <button
              onClick={() => navigate("/admin/register")}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;