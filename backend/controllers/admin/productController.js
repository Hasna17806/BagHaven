import Product from '../../models/Product.js';
import mongoose from 'mongoose';
import cloudinary from '../../config/cloudinary.js';

/**
 * Get all products (admin)
 */
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    
    const formattedProducts = products.map(product => {
      const formattedProduct = { ...product };
      
      if (formattedProduct.images && Array.isArray(formattedProduct.images)) {
        formattedProduct.images = formattedProduct.images.map(img => {
          if (!img || img.trim() === '') return '';
          
          if (img.startsWith('http')) return img;
          if (img.startsWith('/uploads/')) return img;
          
          return `/uploads/${img}`;
        }).filter(img => img !== '');
      } else {
        formattedProduct.images = [];
      }
      
      return formattedProduct;
    });
    
    res.json({
      success: true,
      products: formattedProducts,
      count: formattedProducts.length
    });
    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to load products'
    });
  }
};

/**
 * Create new product
 */

export const createProduct = async (req, res) => {
  try {
    console.log('📦 Creating product...');
    console.log('📋 Request body:', req.body);
    console.log('🖼️ Files received:', req.files ? req.files.length : 0);

    // Validate required fields
    const { name, price, category } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category'
      });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
  let images = [];

if (req.files && req.files.length > 0) {
  for (const file of req.files) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "products" }
    );

    images.push(result.secure_url);
  }
} else {
  return res.status(400).json({
    success: false,
    message: "At least one image is required"
  });
}
      console.log('📸 Images saved:', images);
    } else {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    // Parse isActive correctly
    let isActive = true;
    if (req.body.isActive !== undefined) {
      isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }

    // Create product object
    const productData = {
      name: name.trim(),
      description: req.body.description ? req.body.description.trim() : '',
      price: parseFloat(price),
      category: category.toLowerCase().trim(),
      brand: req.body.brand ? req.body.brand.trim() : '',
      images,
      isActive,
      stock: req.body.stock ? parseInt(req.body.stock) : 0
    };

    console.log('📝 Final product data:', productData);

    // Validate category against enum
    const validCategories = ["women", "men", "kids", "laptops", "phones", "tablets", "accessories", "other"];
    if (!validCategories.includes(productData.category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Create and save product
    const product = new Product(productData);
    await product.save();

    console.log('✅ Product created successfully:', product._id);

    // Format response with image URLs
    const formattedProduct = {
      ...product.toObject(),
      images: product.images.map(img => `/uploads/${img}`)
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: formattedProduct
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating product'
    });
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Format images to include full URL
    const formattedProduct = {
      ...product,
      images: product.images.map(img => 
        img.startsWith('http') ? img : `/uploads/${img}`
      )
    };

    res.json({
      success: true,
      product: formattedProduct
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};


  //Update product
 
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('📋 Update request body:', req.body);
    console.log('🖼️  Files received:', req.files ? req.files.length : 0);
    console.log('📸 Existing images:', existingProduct.images);

    // Handle image uploads - combine existing and new images
    let images = existingProduct.images;
    
    // If existing images are provided in the request (from frontend)
    if (req.body.existingImages) {
      try {
        images = JSON.parse(req.body.existingImages);
        console.log('📝 Using provided existing images:', images);
      } catch (e) {
        console.log('⚠️ Could not parse existingImages:', e.message);
      }
    }
    
if (req.files && req.files.length > 0) {
  for (const file of req.files) {
    const uploadResult = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      { folder: "products" }
    );
    images.push(uploadResult.secure_url);
  }
}


    console.log('📸 Final images array:', images);

    // Parse isActive
    let isActive = existingProduct.isActive;
    if (req.body.isActive !== undefined) {
      isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }

    // Update product data
    const updateData = {
      name: req.body.name ? req.body.name.trim() : existingProduct.name,
      description: req.body.description ? req.body.description.trim() : existingProduct.description,
      price: req.body.price ? parseFloat(req.body.price) : existingProduct.price,
      category: req.body.category ? req.body.category.trim() : existingProduct.category,
      brand: req.body.brand ? req.body.brand.trim() : existingProduct.brand,
      isActive,
      images,
      updatedAt: Date.now()
    };

    // Validate category
    const validCategories = ["women", "men", "kids", "laptops", "phones", "tablets", "accessories", "other"];
    if (updateData.category && !validCategories.includes(updateData.category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Format images for response
    const formattedProduct = {
      ...updatedProduct.toObject(),
      images: updatedProduct.images.map(img => `/uploads/${img}`)
    };

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: formattedProduct
    });

  } catch (error) {
    console.error('❌ Error updating product:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating product'
    });
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};
