import axios from "axios";

// Global token management
let currentToken = null;
let currentAdminToken = null;

// Function to update tokens globally
export const updateAuthTokens = () => {
  currentToken = localStorage.getItem("token");
  currentAdminToken = localStorage.getItem("adminToken");
  
  // Log for debugging
  if (currentToken) {
    console.log("✅ User token loaded:", currentToken.substring(0, 20) + "...");
  }
  if (currentAdminToken) {
    console.log("✅ Admin token loaded:", currentAdminToken.substring(0, 20) + "...");
  }
};

// Initialize tokens on app load
updateAuthTokens();

// Listen for storage changes 
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'token' || event.key === 'adminToken') {
      updateAuthTokens();
      console.log("🔄 Token updated from storage event");
    }
  });
}

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
API.interceptors.request.use((req) => {
  const url = req.url || '';
  

  console.log(`📤 [${req.method}] ${url}`);
  
  // Routes that don't need authorization
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/products',
    '/products/categories',
    '/products/search'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    url === route || 
    url.startsWith(route + '/') ||
    (route === '/products' && (url === '/products' || url.includes('/products?')))
  );
  
  if (isPublicRoute) {
    console.log("🌐 Public route - no token needed");
    return req;
  }
  
  let token = null;
  let tokenType = '';
  
  // Check if it's an admin route
  const isAdminRoute = url.includes('/admin/');
  
  if (isAdminRoute) {
    token = currentAdminToken || localStorage.getItem("adminToken");
    tokenType = 'admin';
  } else {
    token = currentToken || localStorage.getItem("token");
    tokenType = 'user';
  }
  
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
    console.log(`🔑 Using ${tokenType} token for: ${url.substring(0, 50)}...`);
  } else {
    console.warn(`⚠️ No ${tokenType} token found for: ${url}`);
    
    // If it's a protected route without token, redirect to login
    if (!isPublicRoute && tokenType === 'user') {
      console.warn("⚠️ User token missing for protected route");
    }
  }

  return req;
}, (error) => {
  console.error("❌ Request interceptor error:", error);
  return Promise.reject(error);
});

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.status}] ${response.config.url}`);
    
    if (response.data?.token) {
      if (response.config.url.includes('/admin/')) {
        localStorage.setItem("adminToken", response.data.token);
        currentAdminToken = response.data.token;
        console.log("🔄 Admin token updated from response");
      } else {
        localStorage.setItem("token", response.data.token);
        currentToken = response.data.token;
        console.log("🔄 User token updated from response");
      }
    }
    
    return response;
  },
  (error) => {
    const url = error.config?.url || 'unknown';
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase() || 'GET';
    
    console.error(`❌ [${method} ${status}] ${url}:`, {
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      config: {
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    
    // Handle different error cases
    switch (status) {
      case 401: // Unauthorized
        console.warn("🚫 401 Unauthorized - Token invalid/expired");
        handleUnauthorized(url);
        break;
        
      case 403: // Forbidden
        console.warn("🚫 403 Forbidden - Access denied");
        if (url.includes('/admin/')) {
          // Admin doesn't have access
          localStorage.removeItem("adminToken");
          currentAdminToken = null;
        } else {

            console.warn("⚠️ 403 For user route - but NOT clearing tokens");

          // User is blocked or doesn't have permission
          // localStorage.removeItem("token");
          // currentToken = null;
          // localStorage.removeItem("user");
        }
        break;
        
      case 404: // Not Found
        console.warn("🔍 404 Not Found - Resource doesn't exist");
        break;
        
      case 429: // Too Many Requests
        console.warn("🚦 429 Too Many Requests - Rate limited");
        break;
        
      case 500: // Internal Server Error
        console.error("💥 500 Internal Server Error");
        break;
        
      case 502: // Bad Gateway
      case 503: // Service Unavailable
      case 504: // Gateway Timeout
        console.error("🔌 Server connection issue:", status);
        break;
        
      default:
        if (!error.response) {
          // Network error or server not responding
          console.error("🌐 Network error - Server might be down");
        }
    }
    
    // Show user-friendly error message
    if (error.response?.data?.message) {
      const errorEvent = new CustomEvent('api-error', {
        detail: {
          message: error.response.data.message,
          status,
          url
        }
      });
      window.dispatchEvent(errorEvent);
    }
    
    return Promise.reject(error);
  }
);

// Helper function for unauthorized handling
const handleUnauthorized = (url) => {
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('/profile')) {
    console.log("🛑 On profile page - NOT clearing tokens for 401");
    return;
  }
  
  if (url.includes('/admin/')) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    currentAdminToken = null;
    console.log("🚪 Admin session expired/cleared");
    
    if (!window.location.pathname.includes('/admin/login')) {
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 1000);
    }
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    currentToken = null;
    console.log("🚪 User session expired/cleared");
    
    const isAuthPage = currentPath.includes('/login') || 
                       currentPath.includes('/register') ||
                       currentPath.includes('/admin/');
    
    if (!isAuthPage) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  }
};

// Export helper functions
export const clearAuthTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("user");
  currentToken = null;
  currentAdminToken = null;
  console.log("🧹 All auth tokens cleared");
};

export const setUserToken = (token) => {
  localStorage.setItem("token", token);
  currentToken = token;
  console.log("✅ User token set");
};

export const setAdminToken = (token) => {
  localStorage.setItem("adminToken", token);
  currentAdminToken = token;
  console.log("✅ Admin token set");
};

export const getCurrentToken = () => currentToken;
export const getCurrentAdminToken = () => currentAdminToken;

// Listen for auth state changes from other parts of the app
if (typeof window !== 'undefined') {
  window.addEventListener('authStateChanged', () => {
    updateAuthTokens();
    console.log("🔄 Auth tokens updated from authStateChanged event");
  });
}

export default API;