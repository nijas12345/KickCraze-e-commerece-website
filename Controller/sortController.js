const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");

const loadSortAZ = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });
      const name = category.name;
      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ name: 1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ name: 1 });
      // const categories = await
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .statusCode(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const loadSortZA = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });
      const name = category.name;
      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ name: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ name: -1 });
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .status(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const highToLow = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ disprice: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ disprice: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .status(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const lowToHigh = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });
      const name = category.name;
      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ disprice: 1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ disprice: 1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .status(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const newArrivals = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });
      const name = category.name;
      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ data: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ date: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .status(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
    }
  } catch (error) {
    return renderError(res, error);
  }
};


module.exports = {
  loadSortAZ,
  loadSortZA,
  highToLow,
  lowToHigh,
  newArrivals,
}