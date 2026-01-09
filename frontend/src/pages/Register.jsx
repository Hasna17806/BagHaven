import { useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Add this import
import toast, { Toaster } from "react-hot-toast";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Check, 
  ArrowRight,
  Package,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Add this

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Register the user
      const response = await API.post("/auth/register", form);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Use AuthContext login to properly set the user
        const loginResult = await login({ token, user });
        
        if (loginResult.success) {
          toast.success(
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Account created successfully! Redirecting...</span>
            </div>,
            { duration: 2000 }
          );
          
          // Clear form
          setForm({ name: "", email: "", password: "" });
          
          // Redirect to home page
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          toast.error(
            <div className="flex items-center gap-2">
              <span className="text-red-600">✕</span>
              <span>Registration successful but login failed. Please login manually.</span>
            </div>,
            { duration: 4000 }
          );
          
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
        
      } else {
        toast.error(
          <div className="flex items-center gap-2">
            <span className="text-red-600">✕</span>
            <span>{response.data.message || "Registration failed"}</span>
          </div>,
          { duration: 4000 }
        );
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Registration failed. Please try again.";
      toast.error(
        <div className="flex items-center gap-2">
          <span className="text-red-600">✕</span>
          <span>{errorMessage}</span>
        </div>,
        { duration: 4000 }
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // Demo credentials for testing
  const fillDemoCredentials = () => {
    const demoName = "Demo User";
    const demoEmail = `demo${Math.floor(Math.random() * 1000)}@example.com`;
    const demoPassword = "demo123";
    
    setForm({
      name: demoName,
      email: demoEmail,
      password: demoPassword
    });
    
    toast.success(
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <span>Demo credentials filled! Click Register to continue.</span>
      </div>,
      { duration: 3000 }
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#000',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '16px',
            fontSize: '14px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          },
        }}
      />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-70"></div>
            <div className="relative bg-black p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 font-serif">
          Join BagHaven
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create account & start shopping immediately
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-200">
          {/* Quick Register Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Shop immediately after registration!</p>
                <p className="text-xs text-gray-600 mt-1">You'll be automatically logged in and redirected to our products.</p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </div>
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Enter your full name"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm transition duration-200 hover:border-gray-400"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </div>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="Enter your email"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm transition duration-200 hover:border-gray-400"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </div>
                </label>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors flex items-center gap-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="At least 6 characters"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm transition duration-200 hover:border-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
                <div className="text-xs">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${form.password.length >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${form.password.length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className={`inline-block w-2 h-2 rounded-full ${form.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-black hover:text-gray-800 font-medium transition duration-150">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-black hover:text-gray-800 font-medium transition duration-150">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:-translate-y-0.5 group"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating your account...
                  </>
                ) : (
                  <>
                    Register & Start Shopping
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Button (for development/testing) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Try Demo Registration
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
              >
                <span>Sign in to your account</span>
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Instant Access Benefits:
            </h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium">Auto-login:</span> Shop immediately after registration
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium">Personalized:</span> Save wishlist & cart items
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium">Express Checkout:</span> Faster shopping experience
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium">Order Tracking:</span> Real-time updates on purchases
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium">Exclusive Offers:</span> Members-only discounts & deals
              </li>
            </ul>
          </div>

          {/* Post-Registration Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              After registration, you'll be automatically redirected to our product collection.
              You can always access your account from the profile icon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;