import { useEffect, useState } from "react";
import { getAllProducts } from "../api/product";
import { Link } from "react-router-dom";
import { addToCart } from "../api/cart";
import { addToWishlist } from "../api/wishlist";
import toast, { Toaster } from "react-hot-toast";
import {
  ShoppingBag,
  Crown,
  Heart,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Star,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const heroImages = [
    "https://images.unsplash.com/photo-1667313774260-b6ebccbecad4",
    "https://media.istockphoto.com/id/1400284607/photo/young-woman-with-stylish-waist-bag-outdoors-closeup.jpg?s=612x612&w=0&k=20&c=aEptWUw6JgbGOtZJMe2u5jv0SZIXLmT2My18aU0qjB8=",
    "https://cdn.shopify.com/s/files/1/0266/6276/4597/files/Men_s_Autumn_Winter_2025_Fashion_Collection_Westside.png?v=1755861609",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getAllProducts();
        const allProducts = res.data.products || res.data;
        setProducts(allProducts);
        setFeaturedProducts(allProducts.slice(0, 5)); 
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((i) => (i + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = async (id, name) => {
    try {
      await addToCart(id, 1);
      toast.success(`${name} added to cart`);
    } catch {
      toast.error("Please login first");
    }
  };

  const handleAddToWishlist = async (id, name) => {
    try {
      await addToWishlist(id);
      toast.success(`${name} added to wishlist`);
    } catch {
      toast.error("Please login first");
    }
  };

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white min-h-screen">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1f2937',
          color: '#fff',
        },
      }} />

      {/* HERO */}
      <section className="relative h-[85vh] overflow-hidden">
        {heroImages.map((img, i) => (
          <div key={i} className="absolute inset-0">
            <img
              src={img}
              className={`w-full h-full object-cover transition-all duration-1000 ${
                i === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

        <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-6">
          <div className="text-white max-w-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-12 bg-amber-500"></div>
              <span className="uppercase text-sm tracking-wider text-amber-400 font-medium">
                Exclusive Collection 2025
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Premium Bags
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                For Every Journey
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-lg">
              Discover handcrafted bags that blend timeless style with modern functionality
            </p>
            <div className="flex gap-4 pt-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="group-hover:scale-110 transition-transform" />
                Shop Collection
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300"
              >
                Explore More
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() =>
            setCurrentImageIndex(
              currentImageIndex === 0
                ? heroImages.length - 1
                : currentImageIndex - 1
            )
          }
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white/30 transition-all group"
        >
          <ChevronRight className="rotate-180 group-hover:scale-110 transition-transform" size={24} />
        </button>

        <button
          onClick={() =>
            setCurrentImageIndex((currentImageIndex + 1) % heroImages.length)
          }
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white/30 transition-all group"
        >
          <ChevronRight className="group-hover:scale-110 transition-transform" size={24} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`h-1 transition-all duration-300 rounded-full ${
                i === currentImageIndex ? "w-8 bg-white" : "w-4 bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-8 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Award />, number: "10K+", label: "Happy Customers" },
              { icon: <TrendingUp />, number: "500+", label: "Products" },
              { icon: <Star />, number: "4.9", label: "Average Rating" },
              { icon: <Zap />, number: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-2 text-amber-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Crown className="text-amber-500" size={32} />
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                Featured Collection
              </span>
            </h2>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Handpicked premium bags that define elegance and durability
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {featuredProducts.map((p) => (
              <div
                key={p._id}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <Link to={`/product/${p._id}`}>
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden relative">
                    <img
                      src={`http://localhost:5000${p.images[0]}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      NEW
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-semibold truncate text-gray-800 group-hover:text-amber-600 transition-colors">{p.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-lg font-bold text-gray-900">₹{p.price}</p>
                      <div className="flex items-center gap-1">
                        <Star className="text-amber-400 fill-amber-400" size={14} />
                        <span className="text-xs text-gray-600">4.8</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* <div className="flex border-t border-gray-100">
                  <button
                    onClick={() => handleAddToCart(p._id, p.name)}
                    className="flex-1 text-sm font-medium py-3 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(p._id, p.name)}
                    className="px-4 border-l border-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors group/heart"
                  >
                    <Heart size={16} className="group-hover/heart:fill-red-500 transition-all" />
                  </button>
                </div> */}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-base font-semibold text-gray-700 hover:text-amber-600 transition-colors group"
          >
            View All Products
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                Shop by Category
              </span>
            </h2>
            <p className="text-gray-600 text-lg">Find the perfect bag for your lifestyle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Women's Collection",
                value: "women",
                img: "https://www.westside.com/cdn/shop/files/301054067TAUPE_1_eb62134e-7f1b-4d0f-85aa-4c2f29e050a5.jpg?v=1765874647&width=493",
                desc: "Elegant handbags & clutches",
              },
              {
                name: "Men's Collection",
                value: "men",
                img: "https://static.zara.net/assets/public/e4a6/dc86/0dd744439856/7ef571c7ec42/13313720800-a2/13313720800-a2.jpg?ts=1764337380874&w=1125",
                desc: "Professional & casual bags",
              },
              {
                name: "Kids Collection",
                value: "kids",
                img: "https://www.goodgudi.com/cdn/shop/files/Websitemodels1_23_2048x.jpg?v=1748262492",
                desc: "Fun & durable school bags",
              },
            ].map((c) => (
              <Link
                to={`/products?category=${c.value}`}
                key={c.value}
                className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={c.img}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-3xl font-bold mb-2">{c.name}</h3>
                  <p className="text-gray-200 mb-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100">{c.desc}</p>
                  <div className="inline-flex items-center gap-2 text-amber-400 font-semibold">
                    Shop Now
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl opacity-20 blur-2xl"></div>
              <img
                src="https://media.istockphoto.com/id/1157981866/photo/back-to-school-education-concept-with-girl-kids-elementary-students-carrying-backpacks-going.jpg?s=612x612&w=0&k=20&c=GScuOYDeqFzgCC36Y2aT4NRjCQkI2hV3a8dmfLNv4eQ="
                className="relative rounded-3xl shadow-2xl"
                alt="Craftsmanship"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-block">
                <span className="text-amber-600 font-semibold text-sm tracking-wider uppercase">Our Story</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Crafted with Precision,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">
                  Designed for Life
                </span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Every bag in our collection tells a story of meticulous craftsmanship 
                and thoughtful design. We source premium materials and work with skilled 
                artisans to create bags that are built to last.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                From everyday essentials to statement pieces, find the perfect bag 
                that complements your lifestyle and carries your world.
              </p>
              <div className="flex gap-4 pt-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Explore Collection
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Truck size={28} />,
                title: "Free Shipping",
                desc: "On orders over ₹999",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: <Shield size={28} />,
                title: "Secure Payment",
                desc: "100% protected checkout",
                color: "from-green-500 to-green-600",
              },
              {
                icon: <RotateCcw size={28} />,
                title: "Easy Returns",
                desc: "30-day return policy",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: <MessageCircle size={28} />,
                title: "24/7 Support",
                desc: "Dedicated customer care",
                color: "from-orange-500 to-orange-600",
              },
            ].map((f, i) => (
              <div key={i} className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${f.color} rounded-2xl mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h4 className="font-bold text-xl mb-3 text-gray-900">{f.title}</h4>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* ------------------------------------------------------------ */}

      {/* PROMO BANNER */}
      <section className="py-24 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmYWNjMTUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtMyAzLTYgNi02czYgMyA2IDYtMyA2LTYgNi02LTMtNi02em0tMTIgMGMwLTMgMy02IDYtNnM2IDMgNiA2LTMgNi02IDYtNi0zLTYtNnptMjQgMjRjMC0zIDMtNiA2LTZzNiAzIDYgNi0zIDYtNiA2LTYtMy02LTZ6bS0xMiAwYzAtMyAzLTYgNi02czYgMyA2IDYtMyA2LTYgNi02LTMtNi02em0tMTIgMGMwLTMgMy02IDYtNnM2IDMgNiA2LTMgNi02IDYtNi0zLTYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2 rounded-full text-sm font-bold mb-6 animate-pulse">
                <Sparkles size={16} />
                Limited Time Offer
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                New Collection Launch
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  Up to 50% Off
                </span>
              </h2>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                Upgrade your bag collection with our latest arrivals at exclusive 
                launch prices. Premium quality, unbeatable value!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black text-white px-10 py-5 rounded-full hover:shadow-2xl transition-all font-bold text-lg transform hover:-translate-y-1"
              >
                Shop the Sale
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl opacity-20 blur-3xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1597633125184-9fd7e54f0ff7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFnc3xlbnwwfHwwfHx8MA%3D%3D"
                  className="relative rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  alt="Sale"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                What Our Customers Say
              </span>
            </h2>
            <p className="text-gray-600 text-lg">Join thousands of happy customers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Fashion Designer",
                review:
                  "The quality is outstanding! My laptop bag is both stylish and incredibly durable. Best purchase this year.",
                rating: 5,
                image: "PS",
              },
              {
                name: "Rahul Verma",
                role: "Travel Blogger",
                review:
                  "Perfect travel companion. The backpack has so many compartments and the material is water-resistant. Highly recommend!",
                rating: 5,
                image: "RV",
              },
              {
                name: "Ananya Singh",
                role: "Business Professional",
                review:
                  "Loved the variety and the craftsmanship. My handbag gets compliments everywhere I go. Worth every rupee!",
                rating: 5,
                image: "AS",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-amber-400" size={20} />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 text-lg leading-relaxed italic">"{t.review}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {t.image}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-600">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmYWNjMTUiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMThjMC0zIDMtNiA2LTZzNiAzIDYgNi0zIDYtNiA2LTYtMy02LTZ6bS0xMiAwYzAtMyAzLTYgNi02czYgMyA2IDYtMyA2LTYgNi02LTMtNi02em0yNCAyNGMwLTMgMy02IDYtNnM2IDMgNiA2LTMgNi02IDYtNi0zLTYtNnptLTEyIDBjMC0zIDMtNiA2LTZzNiAzIDYgNi0zIDYtNiA2LTYtMy02LTZ6bS0xMiAwYzAtMyAzLTYgNi02czYgMyA2IDYtMyA2LTYgNi02LTMtNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-6 mx-auto">
            <Sparkles className="text-white" size={36} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Exclusive Community</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Subscribe to get special offers, style tips, and exclusive early access to new collections
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-full text-black font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all"
            />
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-4 rounded-full font-bold hover:shadow-xl transition-all transform hover:-translate-y-0.5 whitespace-nowrap">
              Subscribe Now
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            Join 10,000+ subscribers. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;

//______________________________________________________________

// import { useEffect, useState } from "react";
// import { getAllProducts } from "../api/product";
// import { Link } from "react-router-dom";
// import { addToCart } from "../api/cart";
// import { addToWishlist } from "../api/wishlist";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   ShoppingBag,
//   Crown,
//   Heart,
//   ChevronRight,
//   ArrowRight,
//   Sparkles,
//   Truck,
//   Shield,
//   RotateCcw,
//   MessageCircle,
//   Star,
//   TrendingUp,
//   Award,
//   Zap,
//   ChevronLeft,
// } from "lucide-react";

// const Home = () => {
//   const [products, setProducts] = useState([]);
//   const [featuredProducts, setFeaturedProducts] = useState([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const heroImages = [
//     "https://images.unsplash.com/photo-1667313774260-b6ebccbecad4",
//     "https://media.istockphoto.com/id/1400284607/photo/young-woman-with-stylish-waist-bag-outdoors-closeup.jpg?s=612x612&w=0&k=20&c=aEptWUw6JgbGOtZJMe2u5jv0SZIXLmT2My18aU0qjB8=",
//     "https://cdn.shopify.com/s/files/1/0266/6276/4597/files/Men_s_Autumn_Winter_2025_Fashion_Collection_Westside.png?v=1755861609",
//   ];

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await getAllProducts();
//         const allProducts = res.data.products || res.data;
//         setProducts(allProducts);
//         setFeaturedProducts(allProducts.slice(0, 5)); 
//       } catch (err) {
//         toast.error("Failed to load products");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((i) => (i + 1) % heroImages.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleAddToCart = async (id, name) => {
//     try {
//       await addToCart(id, 1);
//       toast.success(`${name} added to cart`);
//     } catch {
//       toast.error("Please login first");
//     }
//   };

//   const handleAddToWishlist = async (id, name) => {
//     try {
//       await addToWishlist(id);
//       toast.success(`${name} added to wishlist`);
//     } catch {
//       toast.error("Please login first");
//     }
//   };

//   return (
//     <div className="bg-white">
//       <Toaster position="top-center" toastOptions={{
//         style: {
//           background: '#18181b',
//           color: '#fff',
//           borderRadius: '12px',
//           padding: '16px',
//         },
//       }} />

//       {/* HERO SECTION - Minimalist & Elegant */}
//       <section className="relative h-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-stone-50 to-neutral-100">
//         {heroImages.map((img, i) => (
//           <div key={i} className="absolute inset-0">
//             <img
//               src={img}
//               className={`w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${
//                 i === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"
//               }`}
//               alt="Hero"
//             />
//           </div>
//         ))}
//         <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />

//         <div className="relative z-10 h-full flex items-center">
//           <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
//             <div className="max-w-3xl space-y-8 animate-fadeIn">
//               <div className="inline-block">
//                 <span className="text-amber-400 text-sm font-medium tracking-[0.3em] uppercase">
//                   Luxury Collection 2025
//                 </span>
//               </div>
              
//               <h1 className="text-6xl md:text-7xl lg:text-8xl font-light leading-[1.1] text-white">
//                 Redefining
//                 <br />
//                 <span className="font-bold italic bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
//                   Elegance
//                 </span>
//               </h1>
              
//               <p className="text-xl md:text-2xl text-gray-200 font-light max-w-xl leading-relaxed">
//                 Discover handcrafted bags where artistry meets functionality
//               </p>
              
//               <div className="flex gap-4 pt-6">
//                 <Link
//                   to="/products"
//                   className="group relative inline-flex items-center gap-3 bg-white text-black px-10 py-5 overflow-hidden transition-all duration-500 hover:pr-12"
//                 >
//                   <span className="relative z-10 font-medium tracking-wide">Explore Collection</span>
//                   <ArrowRight className="relative z-10 transition-transform duration-500 group-hover:translate-x-2" size={20} />
//                   <div className="absolute inset-0 bg-amber-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
//                 </Link>
                
//                 <Link
//                   to="/products"
//                   className="inline-flex items-center gap-2 text-white px-10 py-5 border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
//                 >
//                   <span className="font-medium tracking-wide">Learn More</span>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Elegant Navigation */}
//         <button
//           onClick={() =>
//             setCurrentImageIndex(
//               currentImageIndex === 0 ? heroImages.length - 1 : currentImageIndex - 1
//             )
//           }
//           className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
//         >
//           <ChevronLeft size={24} />
//         </button>

//         <button
//           onClick={() =>
//             setCurrentImageIndex((currentImageIndex + 1) % heroImages.length)
//           }
//           className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
//         >
//           <ChevronRight size={24} />
//         </button>

//         {/* Minimal Indicators */}
//         <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
//           {heroImages.map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setCurrentImageIndex(i)}
//               className={`transition-all duration-500 ${
//                 i === currentImageIndex 
//                   ? "w-12 h-1 bg-white" 
//                   : "w-8 h-1 bg-white/40 hover:bg-white/60"
//               }`}
//             />
//           ))}
//         </div>
//       </section>

//       {/* STATS - Refined Typography */}
//       <section className="py-16 bg-zinc-900 text-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//             {[
//               { icon: <Award />, number: "10K+", label: "Happy Customers" },
//               { icon: <TrendingUp />, number: "500+", label: "Premium Products" },
//               { icon: <Star />, number: "4.9", label: "Customer Rating" },
//               { icon: <Zap />, number: "24/7", label: "Expert Support" },
//             ].map((stat, i) => (
//               <div key={i} className="text-center group">
//                 <div className="flex justify-center mb-4 text-amber-400 transition-transform duration-300 group-hover:scale-110">
//                   {stat.icon}
//                 </div>
//                 <div className="text-4xl font-light mb-2 tracking-tight">{stat.number}</div>
//                 <div className="text-sm text-gray-400 tracking-wide uppercase">{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

      {/* FEATURED PRODUCTS - Clean Grid */}
      // <section className="py-24 bg-gradient-to-b from-white to-zinc-50">
      //   <div className="max-w-7xl mx-auto px-6">
      //     <div className="text-center mb-16 space-y-4">
      //       <span className="text-amber-600 text-sm font-medium tracking-[0.3em] uppercase">
      //         Handpicked Selection
      //       </span>
      //       <h2 className="text-5xl md:text-6xl font-light tracking-tight text-zinc-900">
      //         Featured <span className="italic font-medium">Collection</span>
      //       </h2>
      //       <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
      //         Timeless designs crafted with precision and care
      //       </p>
      //     </div>

      //     {loading ? (
      //       <div className="flex justify-center py-20">
      //         <div className="w-16 h-16 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      //       </div>
//           ) : (
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
//               {featuredProducts.map((p) => (
//                 <Link
//                   key={p._id}
//                   to={`/product/${p._id}`}
//                   className="group"
//                 >
//                   <div className="relative overflow-hidden bg-zinc-100 aspect-[3/4] mb-4 transition-all duration-500 group-hover:shadow-2xl">
//                     <img
//                       src={`http://localhost:5000${p.images[0]}`}
//                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                       alt={p.name}
//                     />
//                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
                    
//                     {/* Hover Overlay */}
//                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
//                       <div className="bg-white px-6 py-3 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
//                         <span className="text-sm font-medium tracking-wide">View Details</span>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="space-y-2">
//                     <h4 className="text-sm font-medium text-zinc-800 tracking-wide group-hover:text-amber-600 transition-colors truncate">
//                       {p.name}
//                     </h4>
//                     <div className="flex items-center justify-between">
//                       <p className="text-lg font-light text-zinc-900">₹{p.price}</p>
//                       <div className="flex items-center gap-1">
//                         <Star className="text-amber-400 fill-amber-400" size={12} />
//                         <span className="text-xs text-gray-600">4.8</span>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}

//           <div className="text-center mt-16">
//             <Link
//               to="/products"
//               className="group inline-flex items-center gap-2 text-zinc-900 hover:text-amber-600 transition-colors"
//             >
//               <span className="text-sm font-medium tracking-wider uppercase">View All Products</span>
//               <ArrowRight className="transition-transform duration-300 group-hover:translate-x-2" size={18} />
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* CATEGORIES - Large Format */}
//       <section className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-16 space-y-4">
//             <span className="text-amber-600 text-sm font-medium tracking-[0.3em] uppercase">
//               Collections
//             </span>
//             <h2 className="text-5xl md:text-6xl font-light tracking-tight text-zinc-900">
//               Shop by <span className="italic font-medium">Style</span>
//             </h2>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {[
//               {
//                 name: "Women's",
//                 value: "women",
//                 img: "https://www.westside.com/cdn/shop/files/301054067TAUPE_1_eb62134e-7f1b-4d0f-85aa-4c2f29e050a5.jpg?v=1765874647&width=493",
//                 desc: "Sophisticated & Timeless",
//               },
//               {
//                 name: "Men's",
//                 value: "men",
//                 img: "https://static.zara.net/assets/public/e4a6/dc86/0dd744439856/7ef571c7ec42/13313720800-a2/13313720800-a2.jpg?ts=1764337380874&w=1125",
//                 desc: "Professional & Versatile",
//               },
//               {
//                 name: "Kids",
//                 value: "kids",
//                 img: "https://www.goodgudi.com/cdn/shop/files/Websitemodels1_23_2048x.jpg?v=1748262492",
//                 desc: "Playful & Durable",
//               },
//             ].map((c) => (
//               <Link
//                 to={`/products?category=${c.value}`}
//                 key={c.value}
//                 className="group relative overflow-hidden aspect-[3/4]"
//               >
//                 <img
//                   src={c.img}
//                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                   alt={c.name}
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
//                 <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
//                   <h3 className="text-3xl font-light mb-2 tracking-tight">{c.name}</h3>
//                   <p className="text-sm text-gray-300 mb-4 tracking-wide">{c.desc}</p>
//                   <div className="inline-flex items-center gap-2 text-amber-400 group-hover:gap-4 transition-all duration-300">
//                     <span className="text-sm tracking-wider uppercase">Explore</span>
//                     <ArrowRight size={16} />
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* BRAND STORY - Split Layout */}
//       <section className="py-24 bg-zinc-50">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="grid md:grid-cols-2 gap-16 items-center">
//             <div className="order-2 md:order-1 space-y-6">
//               <span className="text-amber-600 text-sm font-medium tracking-[0.3em] uppercase">
//                 Our Philosophy
//               </span>
//               <h2 className="text-5xl md:text-6xl font-light leading-tight tracking-tight">
//                 Crafted with
//                 <br />
//                 <span className="italic font-medium text-amber-600">Purpose</span>
//               </h2>
//               <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
//                 <p>
//                   Every piece in our collection represents a commitment to exceptional 
//                   craftsmanship and thoughtful design. We believe in creating bags that 
//                   transcend trends and become lifelong companions.
//                 </p>
//                 <p>
//                   From selecting premium materials to partnering with skilled artisans, 
//                   every step of our process is guided by a dedication to quality and sustainability.
//                 </p>
//               </div>
//               <Link
//                 to="/products"
//                 className="inline-flex items-center gap-2 text-zinc-900 hover:text-amber-600 transition-colors pt-4"
//               >
//                 <span className="text-sm font-medium tracking-wider uppercase">Discover More</span>
//                 <ArrowRight size={18} />
//               </Link>
//             </div>
            
//             <div className="order-1 md:order-2 relative">
//               <img
//                 src="https://media.istockphoto.com/id/1157981866/photo/back-to-school-education-concept-with-girl-kids-elementary-students-carrying-backpacks-going.jpg?s=612x612&w=0&k=20&c=GScuOYDeqFzgCC36Y2aT4NRjCQkI2hV3a8dmfLNv4eQ="
//                 className="w-full shadow-2xl"
//                 alt="Craftsmanship"
//               />
//             </div>
//           </div>
//         </div>
//       </section>

      {/* FEATURES - Minimalist Icons */}
      <section className="py-20 bg-white border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                icon: <Truck size={32} />,
                title: "Complimentary Shipping",
                desc: "On all orders over ₹999",
              },
              {
                icon: <Shield size={32} />,
                title: "Secure Checkout",
                desc: "Protected payment processing",
              },
              {
                icon: <RotateCcw size={32} />,
                title: "Easy Returns",
                desc: "30-day return guarantee",
              },
              {
                icon: <MessageCircle size={32} />,
                title: "Dedicated Support",
                desc: "Expert assistance anytime",
              },
            ].map((f, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="flex justify-center text-amber-600">
                  {f.icon}
                </div>
                <h4 className="text-lg font-medium text-zinc-900">{f.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

//       {/* TESTIMONIALS - Refined Cards */}
//       <section className="py-24 bg-zinc-50">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-16 space-y-4">
//             <span className="text-amber-600 text-sm font-medium tracking-[0.3em] uppercase">
//               Testimonials
//             </span>
//             <h2 className="text-5xl md:text-6xl font-light tracking-tight text-zinc-900">
//               Customer <span className="italic font-medium">Stories</span>
//             </h2>
//           </div>
          
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {[
//               {
//                 name: "Priya Sharma",
//                 role: "Fashion Designer",
//                 review:
//                   "Exceptional quality and timeless design. This bag has become an essential part of my daily routine. Highly recommended.",
//                 rating: 5,
//                 initials: "PS",
//               },
//               {
//                 name: "Rahul Verma",
//                 role: "Travel Enthusiast",
//                 review:
//                   "The perfect travel companion. Durable, stylish, and incredibly functional. Worth every penny.",
//                 rating: 5,
//                 initials: "RV",
//               },
//               {
//                 name: "Ananya Singh",
//                 role: "Business Professional",
//                 review:
//                   "Elegant craftsmanship that receives compliments everywhere. A true investment piece that stands the test of time.",
//                 rating: 5,
//                 initials: "AS",
//               },
//             ].map((t, i) => (
//               <div
//                 key={i}
//                 className="bg-white p-8 border border-zinc-200 hover:shadow-lg transition-all duration-300"
//               >
//                 <div className="flex gap-1 mb-6">
//                   {[...Array(t.rating)].map((_, i) => (
//                     <Star key={i} className="text-amber-400 fill-amber-400" size={16} />
//                   ))}
//                 </div>
//                 <p className="text-gray-700 mb-8 leading-relaxed">"{t.review}"</p>
//                 <div className="flex items-center gap-4 pt-6 border-t border-zinc-100">
//                   <div className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center text-sm font-medium">
//                     {t.initials}
//                   </div>
//                   <div>
//                     <p className="font-medium text-zinc-900">{t.name}</p>
//                     <p className="text-sm text-gray-600">{t.role}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* NEWSLETTER - Elegant Form */}
//       <section className="py-24 bg-zinc-900 text-white">
//         <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
//           <span className="text-amber-400 text-sm font-medium tracking-[0.3em] uppercase">
//             Stay Connected
//           </span>
//           <h2 className="text-5xl md:text-6xl font-light tracking-tight">
//             Join Our <span className="italic font-medium">Community</span>
//           </h2>
//           <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
//             Subscribe for exclusive offers, style inspiration, and early access to new collections
//           </p>
          
//           <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-4">
//             <input
//               type="email"
//               placeholder="Your email address"
//               className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
//             />
//             <button className="px-10 py-4 bg-white text-zinc-900 font-medium hover:bg-amber-500 hover:text-white transition-all duration-300 whitespace-nowrap">
//               Subscribe
//             </button>
//           </div>
          
//           <p className="text-gray-500 text-sm">
//             Join 10,000+ subscribers. Unsubscribe anytime.
//           </p>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;