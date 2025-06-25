const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  delete: {
    type: Boolean,
    default: true,
  },
  offer: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category

