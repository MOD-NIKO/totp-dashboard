import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { axiosInstance } from "../App";
import { toast } from "sonner";
import { LogOut, RefreshCw, Key, Clock } from "lucide-react";

const UserDashboard = ({ session, setSession }) => {
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);

  const generateToken = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/user/generate-token?user_id=${session.user_id}&bit_size=1024`
      );
      setTokenData(response.data);
      setCountdown(response.data.remaining_time);
      toast.success("Token generated successfully!");
    } catch (error) {
      toast.error("Failed to generate token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      generateToken();
    }
  }, [session]);

  useEffect(() => {
    if (!tokenData) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tokenData]);

  const handleLogout = () => {
    setSession(null);
    toast.info("Logged out successfully");
    setTimeout(() => {
      navigate("/");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMzJhM2QiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
                User Dashboard
              </h1>
              <p className="text-sm text-slate-400">Welcome, {session?.username}</p>
            </div>
            <Button
              data-testid="logout-btn"
              onClick={handleLogout}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/20 mb-4">
                <Key className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Your TOTP Token</h2>
              <p className="text-slate-400">Secure time-based authentication code</p>
            </div>

            {tokenData && (
              <div className="space-y-6">
                {/* Token Display */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-xl p-8 text-center">
                  <div data-testid="token-display" className="text-6xl font-bold text-white tracking-widest font-mono mb-4">
                    {tokenData.token}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg">
                      Refreshes in <span data-testid="countdown-timer" className="font-bold text-blue-400">{countdown}</span> seconds
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 30) * 100}%` }}
                  ></div>
                </div>

                {/* Secret Key Info */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                    Session Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Secret Key:</span>
                      <span data-testid="secret-key-display" className="text-slate-200 font-mono text-xs break-all max-w-xs text-right">
                        {tokenData.secret}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Algorithm:</span>
                      <span className="text-slate-200">TOTP (Time-based)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Interval:</span>
                      <span className="text-slate-200">30 seconds</span>
                    </div>
                  </div>
                </div>

                {/* Manual Refresh */}
                <Button
                  data-testid="manual-refresh-btn"
                  onClick={generateToken}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {loading ? "Generating..." : "Generate New Token"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;