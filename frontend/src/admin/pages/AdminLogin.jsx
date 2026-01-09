import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  LogIn,
  AlertCircle,
  Loader2,
} from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 Attempting admin login with:", email);
      
      const { data } = await API.post("/admin/login", { email, password });
      
      console.log("✅ Login response received:", data);
      
      // ✅ ADDED: Check if token is really an ADMIN token
      if (data.token) {
        try {
          // Decode token to check role
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          console.log("🔍 Token payload:", payload);
          
          if (payload.role !== "admin") {
            console.error("❌ Token role is not admin:", payload.role);
            toast.error("Login failed: Not an admin account");
            setIsLoading(false);
            return;
          }
          
          console.log("✅ Token has admin role!");
          
        } catch (decodeError) {
          console.error("❌ Failed to decode token:", decodeError);
          toast.error("Invalid token received");
          setIsLoading(false);
          return;
        }
        
        //  Clear any old tokens first
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("userInfo");
        
        // Save admin token
        localStorage.setItem("adminToken", data.token);
        
        // Verify it was saved
        const savedToken = localStorage.getItem("adminToken");
        console.log("💾 Token saved successfully:", savedToken ? "YES" : "NO");
        
        toast.success("Login successful! Redirecting...", {
          icon: "✅",
          duration:1000,
        });
        
        // Short delay to show success message
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
        
      } else {
        console.error("❌ No token in response");
        toast.error("Login failed: No token received");
      }
      
    } catch (err) {
      console.error("❌ Login error:", err);
      const errorMessage = err.response?.data?.message || "Invalid admin credentials";
      toast.error(errorMessage, {
        icon: "❌",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
          },
        }}
      />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Sign in to access the dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
          <form onSubmit={submitHandler} className="space-y-6">
            {/* Email Input - Prefilled for testing */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <Mail className="h-4 w-4 text-amber-400" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
             
            </div>

            {/* Password Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <Lock className="h-4 w-4 text-amber-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">
                  Secure Access
                </p>
                <p className="text-xs text-blue-200">
                  This portal is for authorized administrators only. All login attempts are monitored and logged.
                </p>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-amber-500/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            BagHaven Admin Dashboard
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © 2025 All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;