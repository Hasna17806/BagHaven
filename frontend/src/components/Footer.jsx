import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  Shield
} from "lucide-react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          
          {/* Brand Section with Logo */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-flex items-center group">
              <img 
                src={logo} 
                alt="BagHaven Logo" 
                className="h-8 w-auto transition hover:opacity-80"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback logo if image fails */}
              <div className="hidden items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-20"></div>
                  <div className="relative bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    BagHaven
                  </span>
                  <p className="text-sm text-gray-500 -mt-1">Premium Collection</p>
                </div>
              </div>
            </Link>
            
            <p className="text-sm text-gray-600 leading-relaxed pt-2 max-w-md">
              Discover timeless elegance with our curated collection of premium bags. 
              Quality craftsmanship meets contemporary design for every lifestyle.
            </p>
            
            {/* Social Media */}
            <div className="flex items-center gap-3 pt-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-amber-600 hover:border-amber-200 hover:shadow-sm transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-pink-600 hover:border-pink-200 hover:shadow-sm transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-500 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="mailto:baghavan@gmail.com"
                className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-green-600 hover:border-green-200 hover:shadow-sm transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Categories
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/products" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=women" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Women's Bags
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=men" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Men's Bags
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=kids" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Kids Bags
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=new" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/track-order" 
                  className="text-sm text-gray-600 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
              Contact Info
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Mail className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <a 
                    href="mailto:baghaven@gmail.com"
                    className="text-sm text-gray-800 hover:text-amber-600 transition-colors font-medium"
                  >
                    baghavan@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Phone className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <a 
                    href="tel:+911234567890"
                    className="text-sm text-gray-800 hover:text-amber-600 transition-colors font-medium"
                  >
                    +91 123 456 7890
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Address</p>
                  <span className="text-sm text-gray-800 font-medium">
                    123 Fashion Street<br />
                    Kochi, Kerala 400001
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="border-t border-gray-300 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders over ₹2,000</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-600">7-day return policy</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-600">100% secure checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Multiple Payment</p>
                <p className="text-xs text-gray-600">Various payment options</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300 bg-gray-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">
                © {new Date().getFullYear()} BagHaven. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <Link 
                to="/privacy" 
                className="text-xs md:text-sm text-gray-600 hover:text-amber-600 transition-colors font-medium"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-xs md:text-sm text-gray-600 hover:text-amber-600 transition-colors font-medium"
              >
                Terms of Service
              </Link>
              <Link 
                to="/sitemap" 
                className="text-xs md:text-sm text-gray-600 hover:text-amber-600 transition-colors font-medium"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;