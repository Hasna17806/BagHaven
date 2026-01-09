import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Package,
  User,
  UserPlus,
  LogOut,
  Menu,
  X,
  Search,
  UserCircle,
  Sparkles,
  Home,
  Shield,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/wishlistContext";
import { useAuth } from "../context/AuthContext"; 
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth(); 
  const cartContext = useCart();
  const wishlistContext = useWishlist();

  if (!cartContext || !wishlistContext) return null;

  const { cartCount, cartItems } = cartContext;
  const { wishlistCount } = wishlistContext;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [displayCartCount, setDisplayCartCount] = useState(0);
  const [navUser, setNavUser] = useState(null);
  const [navAuthenticated, setNavAuthenticated] = useState(false);
  

  // Sync auth state with local state
  useEffect(() => {
    console.log("🔐 Navbar: Auth state changed", { 
      isAuthenticated, 
      user: user?.email,
      hasLocalStorageUser: !!localStorage.getItem("user"),
      localStorageUser: localStorage.getItem("user") 
    });
    
    // Always update from localStorage first 
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setNavUser(parsedUser);
        setNavAuthenticated(true);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        setNavUser(null);
        setNavAuthenticated(false);
      }
    } else {
      setNavUser(user);
      setNavAuthenticated(isAuthenticated);
    }
  }, [isAuthenticated, user]);

  // Update display cart count whenever cartCount changes
  useEffect(() => {
    setDisplayCartCount(cartCount || 0);
  }, [cartCount, cartItems]);

  // Listen for auth state change events
  useEffect(() => {
    const handleAuthChange = () => {
      console.log("🔄 Navbar: Auth change event received");
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setNavUser(parsedUser);
          setNavAuthenticated(true);
        } catch (e) {
          console.error("Error parsing stored user:", e);
          setNavUser(null);
          setNavAuthenticated(false);
        }
      } else {
        setNavUser(null);
        setNavAuthenticated(false);
      }
    };

    // Listen for custom event
    window.addEventListener('authStateChanged', handleAuthChange);
    
    // Also listen for storage changes
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const logoutHandler = () => {
    logout(); // Use AuthContext logout function
    navigate("/");
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  // Get user name with fallbacks
  const getUserName = () => {
    if (navUser?.name) return navUser.name;
    if (user?.name) return user.name;
    if (localStorage.getItem("userName")) return localStorage.getItem("userName");
    if (localStorage.getItem("user")) {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        return stored.name || stored.email?.split('@')[0] || "User";
      } catch (e) {
        return "User";
      }
    }
    return "User";
  };

  const getUserEmail = () => {
    if (navUser?.email) return navUser.email;
    if (user?.email) return user.email;
    if (localStorage.getItem("user")) {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        return stored.email || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  };

  const isUserAdmin = () => {
    return navUser?.isAdmin || user?.isAdmin || false;
  };

  const userName = getUserName();
  const userEmail = getUserEmail();
  const isAdmin = isUserAdmin();
  const showAuth = navAuthenticated || isAuthenticated;

  // Debug button for development
  // const debugAuth = () => {
  //   console.log("🔍 DEBUG AUTH STATE:", {
  //     navUser,
  //     navAuthenticated,
  //     contextUser: user,
  //     contextAuthenticated: isAuthenticated,
  //     localStorageUser: localStorage.getItem("user"),
  //     localStorageToken: localStorage.getItem("token"),
  //     authLoading
  //   });
  // };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
      {/* Debug button - only in development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={debugAuth}
          className="fixed bottom-4 right-4 z-50 bg-red-500 text-white p-2 rounded-full text-xs"
        >
          Debug Auth
        </button>
      )}
       */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={logo}
              alt="BagStore Logo"
              className="h-10 w-auto transition hover:opacity-80 lg:h-12"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            {/* Fallback logo */}
            <div className="hidden items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  BagHaven
                </span>
                <p className="text-xs text-gray-500 -mt-1">Premium Collection</p>
              </div>
            </div>
          </Link>

          {/* Center Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
           
            <Link
              to="/products?category=women"
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors relative group"
            >
              Women
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/products?category=men"
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors relative group"
            >
              Men
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/products?category=kids"
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors relative group"
            >
              Kids
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right Side Icons - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
              >
                <Search className="w-5 h-5" />
              </button>

              {isSearchOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSearchOpen(false)}
                  ></div>
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50">
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="text"
                        placeholder="Search for bags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        autoFocus
                      />
                      <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    </form>
                  </div>
                </>
              )}
            </div>

            {showAuth ? (
              <>
                <Link
                  to="/wishlist"
                  className="relative p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-all group"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative p-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all group"
                  title="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {displayCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold animate-pulse">
                      {displayCartCount > 99 ? "99+" : displayCartCount}
                    </span>
                  )}
                </Link>

                {/* Profile Icon */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                    title="Profile"
                  >
                    <div className="relative">
                      <UserCircle className="w-6 h-6" />
                      {isAdmin && (
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white p-0.5 rounded-full">
                          <Shield className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="text-left hidden lg:block">
                      <span className="text-sm font-medium block">
                        {userName.split(' ')[0]}
                      </span>
                      {/* <span className="text-xs text-gray-500 block">
                        {isAdmin ? "Admin" : "Customer"}
                      </span> */}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      ></div>
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                              {isAdmin && (
                                <div className="absolute -top-1 -right-1 bg-purple-500 text-white p-0.5 rounded-full">
                                  <Shield className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 truncate">{userName}</p>
                              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                              {/* <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                                isAdmin 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {isAdmin ? 'Admin' : 'Customer'}
                              </span> */}
                            </div>
                          </div>
                        </div>
                        
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <UserCircle className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Package className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">My Orders</span>
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-all border-t border-gray-100 mt-2"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Shield className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-purple-700">Admin Panel</span>
                          </Link>
                        )}
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        <button
                          onClick={logoutHandler}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium group"
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold group hover:scale-105"
                >
                  <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Search className="w-5 h-5" />
            </button>

            {showAuth && (
              <>
                <Link to="/wishlist" className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link to="/cart" className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                  {displayCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                      {displayCartCount > 9 ? "9+" : displayCartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for bags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 mt-2 pt-4 pb-4 space-y-2">
            {/* User Info if logged in */}
            {showAuth && (
              <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg mb-2 border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    {isAdmin && (
                      <div className="absolute -top-1 -right-1 bg-purple-500 text-white p-1 rounded-full">
                        <Shield className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-600">{userEmail}</p>
                    {/* <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      isAdmin 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {isAdmin ? 'Admin' : 'Customer'}
                    </span> */}
                  </div>
                </div>
              </div>
            )}


            <Link
              to="/products"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              <span className="font-medium">All Products</span>
            </Link>

            <Link
              to="/products?category=women"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="font-medium">Women's Bags</span>
            </Link>

            <Link
              to="/products?category=men"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="font-medium">Men's Bags</span>
            </Link>

            <Link
              to="/products?category=kids"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="font-medium">Kids Bags</span>
            </Link>

            {showAuth && (
              <>
                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Wishlist ({wishlistCount || 0})</span>
                </Link>

                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">My Orders</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">My Profile</span>
                </Link>
                
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-lg transition-all border-t border-gray-100 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-700">Admin Panel</span>
                  </Link>
                )}
              </>
            )}

            <div className="border-t border-gray-200 mt-4 pt-4">
              {showAuth ? (
                <button
                  onClick={logoutHandler}
                  className="w-full flex items-center justify-center gap-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus className="w-5 h-5" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;