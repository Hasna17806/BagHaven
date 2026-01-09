import { Routes, Route, Navigate } from "react-router-dom";
// import { PayPalScriptProvider } from "@paypal/react-paypal-js";

/* ======================
   USER PAGES
====================== */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProducts from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import UserOrders from "./pages/Orders";
import Profile from "./pages/Profile";
import OrderSuccess from "./pages/orderSuccess";
import ReturnOrder from "./pages/ReturnOrder";

/* ======================
   ADMIN PAGES
====================== */
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import AdminUsers from "./admin/pages/Users";
import AdminProducts from "./admin/pages/Products";
import AdminOrders from "./admin/pages/Orders";
import Revenue from "./admin/pages/Revenue";
import AdminProfile from "./admin/pages/Profile";
import AddProduct from "./admin/pages/AddProduct";
import EditProduct from "./admin/pages/EditProduct";
import Help from "./admin/pages/Help";
import Settings from "./admin/pages/Settings";
import Notifications from "./admin/pages/Notifications";

/* ======================
   LAYOUTS & ROUTES
====================== */
import AdminLayout from "./admin/AdminLayout";
import AdminRoute from "./admin/routes/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AlreadyLoggedInRoute from "./components/AlreadyLoggedInRoute";

/* ======================
   COMPONENTS & CONTEXT
====================== */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// import { AuthProvider } from "./context/AuthContext";
// import { CartProvider } from "./context/CartContext";
// import { WishlistProvider } from "./context/wishlistContext.jsx";
// import { SocketProvider } from "./context/SocketContext.jsx";
import { Toaster } from "react-hot-toast";


// User Layout 
const UserLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh]">{children}</main>
      <Footer />
    </>
  );
};

// Main App Component
function App() {
  return (
      <>
        <Toaster position="top-right" />
              
              <Routes>
                {/* ======================
                    PUBLIC USER ROUTES
                ====================== */}
                <Route path="/" element={
                  <UserLayout>
                    <Home />
                  </UserLayout>
                } />
                
                <Route path="/login" element={
                  <AlreadyLoggedInRoute>
                    <UserLayout>
                      <Login />
                    </UserLayout>
                  </AlreadyLoggedInRoute>
                } />
                
                <Route path="/register" element={
                  <AlreadyLoggedInRoute>
                    <UserLayout>
                      <Register />
                    </UserLayout>
                  </AlreadyLoggedInRoute>
                } />
                
                <Route path="/products" element={
                  <UserLayout>
                    <UserProducts />
                  </UserLayout>
                } />
                
                <Route path="/products/:id" element={
                  <UserLayout>
                    <ProductDetails />
                  </UserLayout>
                } />

                {/* PROTECTED USER ROUTES */}
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <UserLayout>
                      <Cart />
                    </UserLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <UserLayout>
                      <Wishlist />
                    </UserLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <UserLayout>
                      <Checkout />
                    </UserLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <UserLayout>
                      <UserOrders />
                    </UserLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserLayout>
                      <Profile />
                    </UserLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/ordersuccess" element={
                  <ProtectedRoute>
                    <UserLayout>
                      <OrderSuccess />
                    </UserLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/return-order" element={
                  <UserLayout>
                    <ReturnOrder />
                  </UserLayout>
                } />

                {/* ======================
                    ADMIN ROUTES
                ====================== */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/add" element={<AddProduct />} />
                  <Route path="products/edit/:id" element={<EditProduct />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="revenue" element={<Revenue />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="help" element={<Help />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="notifications" element={<Notifications />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={
                  <UserLayout>
                    <div className="flex flex-col items-center justify-center py-20">
                      <h1 className="text-6xl font-bold">404</h1>
                      <p className="text-gray-600 mt-4">Page not found</p>
                    </div>
                  </UserLayout>
                } />
              </Routes>
        </>
  );
}

export default App;