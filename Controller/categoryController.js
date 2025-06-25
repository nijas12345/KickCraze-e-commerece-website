const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const Cart = require("../model/cartModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");

const productCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res
      .status(StatusCode.SUCCESS)
      .render("categories", { categories: categories });
  } catch (error) {
    return renderError(res, error);
  }
};

const insertCategories = async (req, res) => {
  try {
    const categories = await Category.findOne({ name: req.body.name });

    if (categories) {
      const categories = await Category.find({ delete: true });
      res.status(StatusCode.SUCCESS).render("categories", {
        message: "This category is already exist",
        categories: categories,
      });
    } else {
      const category = new Category({
        name: req.body.name,
        description: req.body.description,
      });
      await category.save();
      const categories = await Category.find({ delete: true });

      res
        .status(StatusCode.SUCCESS)
        .render("categories", { categories: categories });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const editCategories = async (req, res) => {
  try {
    const categoryId = req.query.id;

    const category = await Category.findOne({ _id: categoryId });

    res
      .status(StatusCode.SUCCESS)
      .render("categoryEdit", { category: category });
  } catch (error) {
    return renderError(res, error);
  }
};

const updateCategories = async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description;
    const Id = req.body.dataId;

    const category = await Category.findOne({ name: name });

    if (category) {
      res
        .status(StatusCode.SUCCESS)
        .json({ message: "Category Name is already exists " });
    } else {
      const categoryData = await Category.findByIdAndUpdate(Id, {
        name: name,
        description: description,
      });

      res
        .status(StatusCode.SUCCESS)
        .json({ redirect: "/admin/product-categories" });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const deleteCategories = async (req, res) => {
  try {
    const categoryId = req.query.id;
    await Category.findByIdAndUpdate(categoryId, {
      delete: false,
    });
    const categories = await Category.find({ delete: true });
    res
      .status(StatusCode.SUCCESS)
      .render("categories", { categories: categories });
  } catch (error) {
    return renderError(res, error);
  }
};

const categoryOffer = async (req, res) => {
  try {
    const categories = await Category.find();
    res
      .status(StatusCode.SUCCESS)
      .render("categoryOffer", { categories: categories });
  } catch (error) {
    return renderError(res, error);
  }
};

const addCategoryOffer = async (req, res) => {
  try {
    const name = req.body.name;
    const offer = req.body.offer;
    const category = await Category.findOne({ name: name });

    if (category) {
      await Category.findOneAndUpdate(
        { name: name },
        { $set: { offer: offer } }
      );
      const products = await Product.find({ category: req.body.name });

      products.forEach(async (product) => {
        if (offer > product.discount) {
          product.disprice = product.price - (offer / 100) * product.price;
          product.offer = offer;
          await product.save();
        } else {
          product.offer = offer;
          product.disprice =
            product.price - (product.discount / 100) * product.price;
          await product.save();
        }
      });

      const categories = await Category.find();
      res
        .status(StatusCode.SUCCESS)
        .render("categoryOffer", { categories: categories });
    } else {
      const categories = await Category.find();
      res.status(StatusCode.SUCCESS).render("categoryOffer", {
        categories: categories,
        message: "No categories exist",
      });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const sportShoe = async (req, res) => {
  try {
    const userId = req.id;
    const categoryId = req.query.id;
    const category = await Category.findOne({ _id: req.query.id });
    const name = category.name;
    const products = await Product.find({ status: true, category: name });
    const categories = await Category.find({ delete: true });

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
      quantity: quantity,
      category: categoryId,
      categories: categories,
    });
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  productCategories,
  insertCategories,
  editCategories,
  deleteCategories,
  editCategories,
  updateCategories,
  categoryOffer,
  addCategoryOffer,
  sportShoe,
};
