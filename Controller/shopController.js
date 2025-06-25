const Logger = require("nodemon/lib/utils/log");
const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const Cart = require("../model/cartModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");

const loadShop = async (req, res) => {
  try {
    let searchQuery = req.query.searchQuery;
    let categoryName = req.query.selectedCategory;
    let selectedValue = req.query.selectedValue;
    let page = parseInt(req.query.page);
    console.log(page,searchQuery,categoryName,selectedValue);
    
    let limit = 5;
    let skip = (page - 1) * limit;
    
    let userId = req.id;

    if (searchQuery !== "" && categoryName == "" && selectedValue == "option") {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      })
        .skip(skip)
        .limit(limit);
      res.status(StatusCode.SUCCESS).render("shop", {
        products: products,
        quantity: quantity,
        total: total,
        categories: categories,
        searchQuery: "",
        categoryName: categoryName,
        selectedValue: selectedValue,
      });
    } else if (
      searchQuery == "" &&
      categoryName !== "" &&
      selectedValue == "option"
    ) {
      
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      const product = await Product.find({status:true})
      console.log(product.length);
      console.log("skip",skip);
      console.log(limit);
      
      const products = await Product.find({
        status: true,
      })
        .skip(skip)
        .limit(limit);
      
      res.status(StatusCode.SUCCESS).render("shop", {
        products: products,
        quantity: quantity,
        total: total,
        categories: categories,
        searchQuery: searchQuery,
        categoryName: categoryName,
        selectedValue: selectedValue,
      });
    } else if (
      searchQuery == "" &&
      categoryName == "" &&
      selectedValue !== "option"
    ) {
      if (selectedValue == "option1") {
        const carts = await Cart.find({ userId: userId });
        console.log("helo");
        
        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });
        const products = await Product.find({ status: true })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option2") {
        const carts = await Cart.find({ userId: userId });

        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });
        const products = await Product.find({ status: true })
          .sort({ name: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option3") {
        const carts = await Cart.find({ userId: userId });

        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });
        const products = await Product.find({ status: true })
          .sort({ disprice: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option4") {
        const carts = await Cart.find({ userId: userId });

        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });

        const products = await Product.find({ status: true })
          .sort({ disprice: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else {
        const carts = await Cart.find({ userId: userId });

        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });
        const products = await Product.find({ status: true })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      }
    } else if (
      searchQuery !== "" &&
      categoryName !== "" &&
      selectedValue == "option"
    ) {
      
      const carts = await Cart.find({ userId: userId });
      
      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      let categories = await Category.find({ delete: true });
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      })
        .skip(skip)
        .limit(limit);
      console.log(products);
      
      res.status(StatusCode.SUCCESS).render("shop", {
        products: products,
        quantity: quantity,
        total: total,
        categories: categories,
        searchQuery: "",
        categoryName: categoryName,
        selectedValue: selectedValue,
      });
    } else if (
      searchQuery !== "" &&
      categoryName == "" &&
      selectedValue !== "option"
    ) {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      if (selectedValue == "option1") {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: "",
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option2") {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ name: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option3") {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ disprice: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option4") {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ disprice: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      }
    } else if (
      searchQuery == "" &&
      categoryName !== "" &&
      selectedValue !== "option"
    ) {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      if (selectedValue == "option1") {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option2") {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ name: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option3") {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ disprice: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option4") {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ disprice: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      }
    } else if (
      searchQuery !== undefined &&
      searchQuery !== "" &&
      categoryName !== "" &&
      selectedValue !== "option"
    ) {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      if (selectedValue == "option1") {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: "",
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option2") {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ name: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option3") {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ disprice: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option4") {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ disprice: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      }
    } else {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      const products = await Product.find({ status: true })
        .skip(skip)
        .limit(limit);

      res.status(StatusCode.SUCCESS).render("shop", {
        products: products,
        quantity: quantity,
        total: total,
        categories: categories,
        searchQuery: searchQuery,
        categoryName: categoryName,
        selectedValue: selectedValue,
      });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  loadShop,
};
