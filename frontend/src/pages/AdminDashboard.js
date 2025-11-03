import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { axiosInstance } from "../App";
import { toast } from "sonner";
import { LogOut, Trash2, RefreshCw, Users, Key, Shield } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const AdminDashboard = ({ session, setSession }) => {
  const navigate = useNavigate();
  const [tokenLogs, setTokenLogs] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = session?.role === "super_admin";

  const fetchTokenLogs = async () => {
    try {
      const response = await axiosInstance.get("/admin/token-logs");
      setTokenLogs(response.data);
    } catch (error) {
      toast.error("Failed to fetch token logs");
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await axiosInstance.get("/admin/pending-registrations");
      setPendingUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch pending registrations");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axiosInstance.get("/admin/users");
      setAllUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const fetchPendingAdmins = async () => {
    try {
      const response = await axiosInstance.get("/admin/pending-admin-registrations");
      setPendingAdmins(response.data);
    } catch (error) {
      toast.error("Failed to fetch pending admin registrations");
    }
  };

  useEffect(() => {
    fetchTokenLogs();
    fetchPendingUsers();
    fetchAllUsers();
    if (isSuperAdmin) {
      fetchPendingAdmins();
    }
  }, []);

  const handleDeleteToken = async (tokenId) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admins can delete tokens");
      return;
    }
    try {
      await axiosInstance.delete(`/admin/token/${tokenId}`);
      toast.success("Token deleted successfully");
      fetchTokenLogs();
    } catch (error) {
      toast.error("Failed to delete token");
    }
  };

  const handleRegenerateToken = async (userId, bitSize) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admins can regenerate tokens");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post(
        `/admin/regenerate-token?user_id=${userId}&bit_size=${bitSize}`
      );
      toast.success(`Token regenerated with ${bitSize} bits`);
      fetchTokenLogs();
    } catch (error) {
      toast.error("Failed to regenerate token");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (registrationId) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admins can approve users");
      return;
    }
    try {
      await axiosInstance.post(`/admin/approve-user/${registrationId}`);
      toast.success("User approved successfully");
      fetchPendingUsers();
      fetchAllUsers();
    } catch (error) {
      toast.error("Failed to approve user");
    }
  };

  const handleRejectUser = async (registrationId) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admins can reject users");
      return;
    }
    try {
      await axiosInstance.delete(`/admin/reject-user/${registrationId}`);
      toast.success("Registration rejected");
      fetchPendingUsers();
    } catch (error) {
      toast.error("Failed to reject user");
    }
  };

  const handleApproveAdmin = async (registrationId) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admins can approve admins");
      return;
    }
    try {
      await axiosInstance.post(
        `/admin/approve-admin/${registrationId}?approver_role=${session.role}`
      );
      toast.success("Admin approved successfully");
      fetchPendingAdmins();
    } catch (error) {
      toast.error("Failed to approve admin");
    }
  };

  const handleRejectAdmin = async (registrationId) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admins can reject admins");
      return;
    }
    try {
      await axiosInstance.delete(
        `/admin/reject-admin/${registrationId}?approver_role=${session.role}`
      );
      toast.success("Admin registration rejected");
      fetchPendingAdmins();
    } catch (error) {
      toast.error("Failed to reject admin");
    }
  };

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
              <h1 className="text-2xl font-bold text-white flex items-center gap-2" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
                <Shield className="w-7 h-7 text-purple-400" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-400">
                {session?.username} • {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
            <Button
              data-testid="admin-logout-btn"
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="tokens" className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-slate-700/50">
              <TabsTrigger data-testid="tokens-tab" value="tokens" className="data-[state=active]:bg-purple-600">
                <Key className="w-4 h-4 mr-2" />
                Token Logs
              </TabsTrigger>
              <TabsTrigger data-testid="pending-tab" value="pending" className="data-[state=active]:bg-purple-600">
                <Users className="w-4 h-4 mr-2" />
                Pending Users ({pendingUsers.length})
              </TabsTrigger>
              {isSuperAdmin && (
                <TabsTrigger data-testid="pending-admins-tab" value="pending-admins" className="data-[state=active]:bg-purple-600">
                  <Shield className="w-4 h-4 mr-2" />
                  Pending Admins ({pendingAdmins.length})
                </TabsTrigger>
              )}
              <TabsTrigger data-testid="users-tab" value="users" className="data-[state=active]:bg-purple-600">
                <Users className="w-4 h-4 mr-2" />
                All Users
              </TabsTrigger>
            </TabsList>

            {/* Token Logs Tab */}
            <TabsContent value="tokens">
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50">
                  <h2 className="text-xl font-bold text-white">Token Generation Logs</h2>
                  <p className="text-sm text-slate-400 mt-1">Monitor all token generation activities</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700/50">
                        <TableHead className="text-slate-300">User</TableHead>
                        <TableHead className="text-slate-300">Secret Key</TableHead>
                        <TableHead className="text-slate-300">Bit Size</TableHead>
                        <TableHead className="text-slate-300">Computation Time</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Created At</TableHead>
                        {isSuperAdmin && <TableHead className="text-slate-300">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokenLogs.map((log) => (
                        <TableRow key={log.id} data-testid={`token-log-${log.id}`} className="border-slate-700/50">
                          <TableCell className="text-slate-200">{log.username}</TableCell>
                          <TableCell className="text-slate-400 font-mono text-xs">
                            {log.secret_key.substring(0, 16)}...
                          </TableCell>
                          <TableCell className="text-slate-200">{log.bit_size} bits</TableCell>
                          <TableCell className="text-slate-200">
                            {log.computation_time.toFixed(4)} ms
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                log.status === "active"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {log.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          {isSuperAdmin && (
                            <TableCell>
                              {log.status === "active" && (
                                <Button
                                  data-testid={`delete-token-${log.id}`}
                                  onClick={() => handleDeleteToken(log.id)}
                                  variant="destructive"
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Bit Size Controls */}
              {isSuperAdmin && allUsers.length > 0 && (
                <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Token Generation Controls</h3>
                  <div className="space-y-4">
                    {allUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
                      >
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-slate-400 text-sm">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          {[1024, 2048, 4096].map((bits) => (
                            <Button
                              key={bits}
                              data-testid={`regenerate-${bits}-${user.id}`}
                              onClick={() => handleRegenerateToken(user.id, bits)}
                              disabled={loading}
                              className="bg-purple-600 hover:bg-purple-700"
                              size="sm"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              {bits} bits
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Pending Approvals Tab */}
            <TabsContent value="pending">
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50">
                  <h2 className="text-xl font-bold text-white">Pending User Registrations</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {isSuperAdmin ? "Approve or reject user registrations" : "View pending registrations"}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700/50">
                        <TableHead className="text-slate-300">Username</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Requested At</TableHead>
                        {isSuperAdmin && <TableHead className="text-slate-300">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id} data-testid={`pending-user-${user.id}`} className="border-slate-700/50">
                          <TableCell className="text-slate-200">{user.username}</TableCell>
                          <TableCell className="text-slate-400">{user.email}</TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {new Date(user.created_at).toLocaleString()}
                          </TableCell>
                          {isSuperAdmin && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  data-testid={`approve-user-${user.id}`}
                                  onClick={() => handleApproveUser(user.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  Approve
                                </Button>
                                <Button
                                  data-testid={`reject-user-${user.id}`}
                                  onClick={() => handleRejectUser(user.id)}
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-700"
                                  size="sm"
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Pending Admin Registrations Tab */}
            {isSuperAdmin && (
              <TabsContent value="pending-admins">
                <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-slate-700/50">
                    <h2 className="text-xl font-bold text-white">Pending Admin Registrations</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Approve or reject admin registration requests
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700/50">
                          <TableHead className="text-slate-300">Username</TableHead>
                          <TableHead className="text-slate-300">Email</TableHead>
                          <TableHead className="text-slate-300">Requested Role</TableHead>
                          <TableHead className="text-slate-300">Requested At</TableHead>
                          <TableHead className="text-slate-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingAdmins.map((admin) => (
                          <TableRow key={admin.id} data-testid={`pending-admin-${admin.id}`} className="border-slate-700/50">
                            <TableCell className="text-slate-200">{admin.username}</TableCell>
                            <TableCell className="text-slate-400">{admin.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                admin.requested_role === "super_admin" 
                                  ? "bg-purple-500/20 text-purple-400" 
                                  : "bg-blue-500/20 text-blue-400"
                              }`}>
                                {admin.requested_role === "super_admin" ? "Super Admin" : "Regular Admin"}
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm">
                              {new Date(admin.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  data-testid={`approve-admin-${admin.id}`}
                                  onClick={() => handleApproveAdmin(admin.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  Approve
                                </Button>
                                <Button
                                  data-testid={`reject-admin-${admin.id}`}
                                  onClick={() => handleRejectAdmin(admin.id)}
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-700"
                                  size="sm"
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* All Users Tab */}
            <TabsContent value="users">
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50">
                  <h2 className="text-xl font-bold text-white">Approved Users</h2>
                  <p className="text-sm text-slate-400 mt-1">All registered and approved users</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700/50">
                        <TableHead className="text-slate-300">Username</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Joined At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((user) => (
                        <TableRow key={user.id} data-testid={`user-${user.id}`} className="border-slate-700/50">
                          <TableCell className="text-slate-200">{user.username}</TableCell>
                          <TableCell className="text-slate-400">{user.email}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              Approved
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {new Date(user.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;