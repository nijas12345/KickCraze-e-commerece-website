const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const path = require('path')

const ListProduct = async (req, res) => {
  try {
    const products = await Product.find({ status: true });

    const categories = await Category.find({ delete: true });
    res
      .status(StatusCode.SUCCESS)
      .render("productList", { product: products, categories: categories });
  } catch (error) {
    return renderError(res, error);
  }
};

const addProduct = async (req, res) => {
  try {
    const categories = await Category.find({ delete: true });
    res
      .status(StatusCode.SUCCESS)
      .render("productAdd", { categories: categories });
  } catch (error) {
    return renderError(res, error);
  }
};

const insertProduct = async (req, res) => {
  try {
    const fileNames = req.files.map((file) => file.filename);
    let image = [];
    fileNames.forEach((filename) => {
      const outputPath2 = "/productImages/" + filename;
      image.push(outputPath2);
    });
    const discount = req.body.discount;
    const categoryy = await Category.findOne({ name: req.body.category });

    const offer = categoryy.offer;

    const price = req.body.price;

    if (offer > discount) {
      const discounts = parseInt(offer);
      const disprice = Math.floor(
        req.body.price - (discounts / 100) * req.body.price
      );

      const product = new Product({
        name: req.body.name,
        price: price,
        disprice: disprice,
        discount: discounts,
        color: req.body.color,
        stock: req.body.stock,
        category: req.body.category,
        size: req.body.size,
        image: image,
      });
      await product.save();
      const products = await Product.find();
      res.status(StatusCode.SUCCESS).redirect("/admin/product-list");
    } else {
      const discounts = parseInt(discount);
      const disprice = Math.floor(
        req.body.price - (discounts / 100) * req.body.price
      );

      const product = new Product({
        name: req.body.name,
        price: price,
        disprice: disprice,
        discount: discount,
        color: req.body.color,
        stock: req.body.stock,
        category: req.body.category,
        size: req.body.size,
        image: image,
      });
      await product.save();
      const products = await Product.find();
      res
        .status(StatusCode.SUCCESS)
        .render("productList", { product: products });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const editProduct = async (req, res) => {
  try {
    const editId = req.query.id;

    const categories = await Category.find({ delete: true });
    const products = await Product.findOne({ _id: editId });

    res
      .status(StatusCode.SUCCESS)
      .render("editProduct", { categories: categories, products: products });
  } catch (error) {
    return renderError(res, error);
  }
};

const insertEditedProduct = async (req, res) => {
  try {
    const fileNames = req.files.map((file) => file.filename);

    let image = [];

    fileNames.forEach((filename) => {
      const outputPath2 = "/productImages/" + filename;
      image.push(outputPath2);
    });

    const id = req.query.id;
    const price = req.body.price;

    const discount = parseInt(req.body.discount);

    const product = Product.findOne({ _id: id });
    const category = Category.findOne({ name: product.category });
    if (category.offer > discount) {
      disprice = Math.floor(
        req.body.price - (category.offer / 100) * req.body.price
      );

      const productData = await Product.findByIdAndUpdate(id, {
        name: req.body.name,
        price: price,
        disprice: disprice,
        discount: discount,
        color: req.body.color,
        stock: req.body.stock,
        category: req.body.category,
        sizes: req.body.sizes,
        offer: category.offer,
        //    image:image
      });

      if (req.body.imagesToRemove && req.body.imagesToRemove.length > 0) {
        // Convert strings to numbers
        const imageIndices = req.body.imagesToRemove.map((index) =>
          parseInt(index)
        );
        // Remove images from productData
        productData.image = productData.image.filter(
          (image, index) => !imageIndices.includes(index)
        );
        await productData.save();
      }
      if (image.length > 0) {
        image.forEach((img) => {
          productData.image.push(img);
        });
        await productData.save();
      }
    } else {
      const disprice = Math.floor(price - (discount / 100) * price);
      const productData = await Product.findByIdAndUpdate(id, {
        name: req.body.name,
        price: price,
        disprice: disprice,
        discount: discount,
        color: req.body.color,
        stock: req.body.stock,
        category: req.body.category,
        sizes: req.body.sizes,
        offer: category.offer,
        //    image:image
      });

      if (req.body.imagesToRemove && req.body.imagesToRemove.length > 0) {
        // Convert strings to numbers
        const imageIndices = req.body.imagesToRemove.map((index) =>
          parseInt(index)
        );

        // Remove images from productData
        productData.image = productData.image.filter(
          (image, index) => !imageIndices.includes(index)
        );

        // Perform database update
        await productData.save();
      }
      if (image.length > 0) {
        image.forEach((img) => {
          productData.image.push(img);
        });
        await productData.save();
      }
    }

    res.status(StatusCode.SUCCESS).redirect("/admin/product-list");
  } catch (error) {
    return renderError(res, error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deleteId = req.body.id;
    await Product.findByIdAndUpdate(deleteId, { status: false });
    res.status(StatusCode.SUCCESS).json({ success: true });
  } catch (error) {
    return renderError(res, error);
  }
};

const productProfile = async (req, res) => {
  try {
    const userId = req.id;

    const productId = req.query.id;
    const products = await Product.findOne({ _id: productId });
    const category = await Category.findOne({ name: products.category });
    const categories = await Category.find({ delete: true });
    const similarProducts = await Product.find({
      status: true,
      category: products.category,
    });
    res.render("productProfile", {
      products: products,
      similarProducts: similarProducts,
      category: category,
      userId: userId,
      categories: categories,
    });
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  insertProduct,
  editProduct,
  insertEditedProduct,
  deleteProduct,
  ListProduct,
  addProduct,
  productProfile,
};
