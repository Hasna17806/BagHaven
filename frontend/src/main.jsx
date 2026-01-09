// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/wishlistContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <BrowserRouter> 
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <WishlistProvider>
              <PayPalScriptProvider
                 options={{
                   "client-id": "AZo80lhIS2oCvqtd9N3iv0HU1rMNdSJ8g8BHsyzreN1EseZPMAbB8yD3kuG6UBq1zDAcgEEGnwFdgFZg",
                   currency: "USD",
                 }} 
              >
              <App />
              </PayPalScriptProvider>
            </WishlistProvider>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  // </StrictMode>
);