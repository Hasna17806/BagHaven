import Product from "../../models/Product.js";
import cloudinary from "../../config/cloudinary.js";

/*
=====================================
GET ALL PRODUCTS (USER) - FIXED
=====================================
*/
export const getProducts = async (req, res, next) => {
  try {
    const { category, limit } = req.query;

    const query = {
      isDeleted: false,
      isActive: true,
    };

    if (category) {
      query.category = category.toLowerCase();
    }

    let productsQuery = Product.find(query).sort({ createdAt: -1 });

    if (limit) {
      productsQuery = productsQuery.limit(Number(limit));
    }

    const productsFromDB = await productsQuery.lean();
    
    const formattedProducts = productsFromDB.map(product => {
      const formattedProduct = { ...product };
      
      // Handle images array
      if (formattedProduct.images && Array.isArray(formattedProduct.images)) {
        formattedProduct.images = formattedProduct.images.map(img => {
          if (!img || img.trim() === '') {
            return ''; 
          }
          
          if (img.startsWith('http')) {
            return img;
          }
          
          if (img.startsWith('/uploads/')) {
            return img;
          }
        
          return `/uploads/${img}`;
          
        }).filter(img => img !== ''); 
      } else {
        formattedProduct.images = [];
      }
      
      if (formattedProduct.images.length === 0) {
        formattedProduct.images = ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop'];
      }
      
      return formattedProduct;
    });

    res.status(200).json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    next(error);
  }
};

/*
=====================================
GET PRODUCTS BY CATEGORY (USER) - FIXED
=====================================
*/
export const getByCategory = async (req, res, next) => {
  try {
    const category = req.params.category.toLowerCase();

    const allowedCategories = ["women", "men", "kids"];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const productsFromDB = await Product.find({
      category,
      isDeleted: false,
      isActive: true,
    }).sort({ createdAt: -1 }).lean();

    const formattedProducts = productsFromDB.map(product => {
      const formattedProduct = { ...product };
      
      if (formattedProduct.images && Array.isArray(formattedProduct.images)) {
        formattedProduct.images = formattedProduct.images.map(img => {
          if (!img || img.trim() === '') return '';
          
          if (img.startsWith('http') || img.startsWith('/uploads/')) {
            return img;
          }
          
          return `/uploads/${img}`;
          
        }).filter(img => img !== '');
      } else {
        formattedProduct.images = [];
      }
      
      if (formattedProduct.images.length === 0) {
        formattedProduct.images = ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop'];
      }
      
      return formattedProduct;
    });

    res.status(200).json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    next(error);
  }
};

/*
=====================================
GET SINGLE PRODUCT BY ID (USER) - FIXED
=====================================
*/
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
      isActive: true,
    }).lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const formattedProduct = { ...product };
    
    if (formattedProduct.images && Array.isArray(formattedProduct.images)) {
      formattedProduct.images = formattedProduct.images.map(img => {
        if (!img || img.trim() === '') return '';
        
        if (img.startsWith('http')) {
          return img;
        }
        
        if (img.startsWith('/uploads/')) {
          return img;
        }
        
        return `/uploads/${img}`;
        
      }).filter(img => img !== '');
    } else {
      formattedProduct.images = [];
    }
    
    if (formattedProduct.images.length === 0) {
      formattedProduct.images = ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop'];
    }

    res.status(200).json({
      success: true,
      product: formattedProduct,
    });
  } catch (error) {
    next(error);
  }
};