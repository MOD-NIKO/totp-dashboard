import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { axiosInstance } from "../App";
import { toast } from "sonner";
import { ArrowLeft, ShieldPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    requested_role: "admin",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        `/admin/register?username=${formData.username}&email=${formData.email}&password=${formData.password}&requested_role=${formData.requested_role}`
      );
      toast.success(response.data.message);
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
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
            <ShieldPlus className="w-8 h-8 text-purple-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 text-white" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
            Admin Registration
          </h1>
          <p className="text-center text-slate-400 mb-8 text-sm">
            Register as an admin and await super admin approval
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-slate-300 mb-2 block">Username</Label>
              <Input
                data-testid="admin-register-username-input"
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
                data-testid="admin-register-email-input"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-slate-900/50 border-slate-600 text-white focus:border-purple-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300 mb-2 block">Password</Label>
              <Input
                data-testid="admin-register-password-input"
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-slate-900/50 border-slate-600 text-white focus:border-purple-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-slate-300 mb-2 block">Requested Role</Label>
              <Select
                value={formData.requested_role}
                onValueChange={(value) => setFormData({...formData, requested_role: value})}
              >
                <SelectTrigger 
                  data-testid="admin-register-role-select"
                  className="bg-slate-900/50 border-slate-600 text-white focus:border-purple-500"
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="admin" className="text-white hover:bg-slate-700">
                    Regular Admin
                  </SelectItem>
                  <SelectItem value="super_admin" className="text-white hover:bg-slate-700">
                    Super Admin
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-2">
                Note: Super admin approval required for both roles
              </p>
            </div>

            <Button
              data-testid="admin-register-submit-btn"
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg mt-6"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register as Admin"}
            </Button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Already have an admin account?{" "}
            <button
              onClick={() => navigate("/admin/login")}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
