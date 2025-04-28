const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  disprice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  image: [
    {
      type: String,
      required: true,
    },
  ],
  date: {
    type: Date,
    default: Date.now(),
  },
  color: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  sizes: {
    type: Array,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    ref: "Category",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  offer: {
    type: Number,
    default: 0,
  },
});
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
