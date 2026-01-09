import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },

    images: [
      {
        type: String,
        required: true,
      },
    ],

    // EXPAND CATEGORY OPTIONS
    category: {
      type: String,
      required: [true, "Product category is required"],
      lowercase: true,
      trim: true,
      enum: ["women", "men", "kids", "laptops", "phones", "tablets", "accessories", "other"],
    },

    // ADD BRAND FIELD (since your frontend uses it)
    brand: {
      type: String,
      trim: true,
      default: "",
    },

    // ADD STOCK FIELD
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.query.active = function () {
  return this.where({ isDeleted: false, isActive: true });
};

const Product = mongoose.model("Product", productSchema);
export default Product;