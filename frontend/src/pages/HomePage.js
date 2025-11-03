import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Shield, User } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMzJhM2QiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="relative z-10 max-w-4xl w-full mx-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/20 mb-6">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
            TOTP Token Generator
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Secure time-based one-time password authentication system with advanced admin controls
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* User Login Card */}
          <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                <User className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">User Access</h2>
              <p className="text-slate-400 mb-6 text-sm">
                Generate and view your secure TOTP tokens with automatic 30-second refresh
              </p>
              <Button
                data-testid="user-login-btn"
                onClick={() => navigate("/user/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                User Login
              </Button>
              <Button
                data-testid="user-register-btn"
                onClick={() => navigate("/user/register")}
                variant="outline"
                className="w-full mt-3 border-slate-600 text-slate-300 hover:bg-slate-700/50 py-3 rounded-lg transition-colors"
              >
                Register New Account
              </Button>
            </div>
          </div>

          {/* Admin Login Card */}
          <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Admin Access</h2>
              <p className="text-slate-400 mb-6 text-sm">
                Monitor, manage, and control all token generation activities and user approvals
              </p>
              <Button
                data-testid="admin-login-btn"
                onClick={() => navigate("/admin/login")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Admin Login
              </Button>
              <Button
                data-testid="admin-register-btn"
                onClick={() => navigate("/admin/register")}
                variant="outline"
                className="w-full mt-3 border-slate-600 text-slate-300 hover:bg-slate-700/50 py-3 rounded-lg transition-colors"
              >
                Register as Admin
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Built with MVP Architecture • Secure TOTP Implementation</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;