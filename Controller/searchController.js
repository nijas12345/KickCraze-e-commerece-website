const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");

const loadSearch = async (req, res) => {
  const searchQuery = req.body.query;
  const categoryId = req.body.category;
  const option = req.body.selectedValue;

  try {
    if (option === "option" || option == undefined) {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option1") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ name: 1 });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option2") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ name: -1 });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option3") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ disprice: 1 });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option4") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ disprice: -1 });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option5") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ date: -1 });

      res.status(StatusCode.SUCCESS).json(products);
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const SearchInput = async (req, res) => {
  const searchQuery = req.body.query;

  const option = req.body.selectedValue;

  try {
    if (option === "option" || option == undefined) {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option1") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ name: 1 });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option2") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ name: -1 });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option3") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ disprice: 1 });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option4") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ disprice: -1 });

      res.status(StatusCode.SUCCESS).json(products);
    } else if (option == "option5") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ date: -1 });

      res.status(StatusCode.SUCCESS).json(products);
    }
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  loadSearch,
  SearchInput,
}