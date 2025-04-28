const User = require("../model/userModel");
const Admin = require("../model/adminModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const createToken = (admin) => {
  const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
  return jwt.sign(admin, ADMIN_JWT_SECRET, { expiresIn: "1h" });
};

const adminRegister = async (req, res) => {
  try {
    res.render("signUp");
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};
const verifyRegister = async (req, res) => {
  try {
    const admin = new Admin({
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
    });

    const adminData = await admin.save();

    if (adminData) {
      const token = createToken({ id: adminData._id });
      res.cookie("Adminjwt", token, { httpOnly: true, maxAge: 3600000 });
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};
const adminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const adminVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await Admin.findOne({ email: email });
    if (adminData) {
      if (adminData.password === password) {
        const token = createToken({ id: adminData._id });
        res.cookie("Adminjwt", token, { httpOnly: true, maxAge: 60000000 });
        res.redirect("/admin/dashboard");
      } else {
        res.render("adminLogin", { message: "Password is incorrect" });
      }
    } else {
      res.render("adminLogin", { message: "Email is incorrect" });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const adminForgot = async (req, res) => {
  try {
    res.render("forgot");
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

//logout

const loadLogout = async (req, res) => {
  try {
    res.clearCookie("Adminjwt");
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

//dashboard

const adminDashboard = async (req, res) => {
  try {
    let year = parseInt(req.query.selectedYear);

    if (isNaN(year)) {
      year = 2024;
    }

    const order = await Order.find();

    const orderData = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const currentYear = new Date().getFullYear();

    // console.log(selectedYear);
    const monthlyData = await Order.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          status: "delivered",
          $expr: {
            $eq: [{ $year: "$orderedDate" }, year],
          },
        },
      },
      {
        $group: {
          _id: { $month: "$orderedDate" },
          totalAmount: {
            $sum: {
              $cond: {
                if: {
                  $gt: [
                    { $toDouble: "$wcTotal" }, // Convert wcTotal to double
                    { $toDouble: "$discountTotal" }, // Convert discountTotal to double
                  ],
                },
                then: { $toDouble: "$wcTotal" }, // Convert wcTotal to double
                else: { $toDouble: "$discountTotal" }, // Convert discountTotal to double
              },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const yearlyData = await Order.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          status: "delivered",
          $expr: {
            $eq: [{ $year: "$orderedDate" }, year],
          },
        },
      },
      {
        $group: {
          _id: { $year: "$orderedDate" },
          totalAmount: {
            $sum: {
              $cond: {
                if: {
                  $gt: [
                    { $toDouble: "$wcTotal" }, // Convert wcTotal to double
                    { $toDouble: "$discountTotal" }, // Convert discountTotal to double
                  ],
                },
                then: { $toDouble: "$wcTotal" }, // Convert wcTotal to double
                else: { $toDouble: "$discountTotal" }, // Convert discountTotal to double
              },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("yearly", yearlyData);
    const bestCategory = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      {
        $lookup: {
          from: "categories",
          localField: "prod.category",
          foreignField: "name",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const bestSellingProduct = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { status: "delivered" } },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product",
          productName: { $first: "$product.name" },
          totalCount: { $sum: "$products.quantity" },
          productImage: { $first: "$product.image" },
        },
      },
      { $sort: { totalCount: -1 } },
      { $limit: 10 },
    ]);

    const bestBrand = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      {
        $group: {
          _id: "$prod.name",
          count: { $sum: 1 },
        },
      },
    ]);

    const yearlyDatas = ["2022", "2023", "2024", "2025", "2026"];
    res.render("dashboard", {
      orderData,
      monthlyData,
      yearlyData,
      bestSellingProduct,
      bestBrand,
      bestCategory,
      yearlyDatas,
    });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

//user Management

const userList = async (req, res) => {
  try {
    const users = await User.find({});
    res.render("userlist", { users: users });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const userBlock = async (req, res) => {
  try {
    const userId = req.query.id;

    const user = await User.find({ _id: userId });

    userStatus = user[0].status;
    if (userStatus == true) {
      await User.findOneAndUpdate({ _id: userId }, { status: false });
      const users = await User.find({});
      res.render("userlist", { users: users });
    } else {
      await User.findOneAndUpdate({ _id: userId }, { status: true });
      const users = await User.find({});
      res.render("userlist", { users: users });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

//category

const productCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.render("categories", { categories: categories });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const insertCategories = async (req, res) => {
  try {
    const categories = await Category.findOne({ name: req.body.name });

    if (categories) {
      const categories = await Category.find({ delete: true });
      res.render("categories", {
        message: "This category is already exist",
        categories: categories,
      });
    } else {
      const category = new Category({
        name: req.body.name,
        description: req.body.description,
      });
      const categoryData = await category.save();
      const categories = await Category.find({ delete: true });

      res.render("categories", { categories: categories });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const editCategories = async (req, res) => {
  try {
    //  req.session.temp = req.query.id
    const categoryId = req.query.id;

    const category = await Category.findOne({ _id: categoryId });

    res.render("categoryEdit", { category: category });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const updateCategories = async (req, res) => {
  try {
    // const data = req.session.temp
    const name = req.body.name;
    const description = req.body.description;
    const Id = req.body.dataId;

    const category = await Category.findOne({ name: name });

    if (category) {
      console.log("hai");
      res.status(200).json({ message: "Category Name is already exists " });
    } else {
      const categoryData = await Category.findByIdAndUpdate(Id, {
        name: name,
        description: description,
      });
      console.log("CAtegory", categoryData);

      res.status(200).json({ redirect: "/admin/product-categories" });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const deleteCategories = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const editCategory = await Category.findByIdAndUpdate(categoryId, {
      delete: false,
    });
    const categories = await Category.find({ delete: true });
    res.render("categories", { categories: categories });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

//Product session

const ListProduct = async (req, res) => {
  try {
    const products = await Product.find();

    const categories = await Category.find({ delete: true });
    res.render("productList", { product: products, categories: categories });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const addProduct = async (req, res) => {
  try {
    const categories = await Category.find({ delete: true });
    res.render("productAdd", { categories: categories });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const insertProduct = async (req, res) => {
  try {
    console.log("req.files", req.files);
    const fileNames = req.files.map((file) => file.filename);

    console.log(fileNames);
    let image = [];

    fileNames.forEach((filename) => {
      const outputPath2 = "/productImages/" + filename;
      console.log("==================", outputPath2);
      image.push(outputPath2);
    });

    //   for(let file of req.files){
    //     const randomInteger = Math.floor(Math.random() * 20000001)

    //     const outputPath1=path.join(__dirname,"../public/croppedImages","crop"+file.filename)
    //     const outputPath2 = "/croppedImages/"+"crop"+file.filename
    //     console.log("imgPath",outputPath1);
    //     const croppedImage = await sharp(file.path)
    //     .resize(1000,1000,{
    //         fit:"fill",
    //     })
    //     .toFile(outputPath1)
    //      image.push(outputPath2)
    //   }
    const discount = req.body.discount;
    const category = req.body.category;
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
        sizes: req.body.sizes,
        image: image,
      });
      const productData = await product.save();
      const products = await Product.find();
      const categories = await Category.find();
      res.render("productList", { product: products });
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
        sizes: req.body.sizes,
        image: image,
      });
      await product.save();
      const products = await Product.find();
      await Category.find();
      res.render("productList", { product: products });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const editProduct = async (req, res) => {
  try {
    const editId = req.query.id;

    const categories = await Category.find({ delete: true });
    const products = await Product.findOne({ _id: editId });

    res.render("editProduct", { categories: categories, products: products });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const insertEditedProduct = async (req, res) => {
  try {
    console.log("req.flies", req.files);
    const fileNames = req.files.map((file) => file.filename);

    console.log(fileNames);
    let image = [];

    fileNames.forEach((filename) => {
      const outputPath2 = "/productImages/" + filename;
      console.log("==================", outputPath2);
      image.push(outputPath2);
    });
    console.log("image", image);

    console.log("2");
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

        // Perform database update
        await productData.save();
      }
      if (image.length !== 0) {
        image.forEach((img) => {
          productData.image.push(img);
        });
        await productData.save();
      }
      console.log("product", productData);
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
      console.log("product data befor removing image", productData);

      if (req.body.imagesToRemove && req.body.imagesToRemove.length > 0) {
        // Convert strings to numbers
        const imageIndices = req.body.imagesToRemove.map((index) =>
          parseInt(index)
        );
        console.log("index  ", imageIndices);

        // Remove images from productData
        productData.image = productData.image.filter(
          (image, index) => !imageIndices.includes(index)
        );

        // Perform database update
        await productData.save();
      }
      if (image.length !== 0) {
        image.forEach((img) => {
          productData.image.push(img);
        });
        await productData.save();
      }

      console.log("product data after removing image", productData);
    }

    const products = await Product.find();

    const categories = await Category.find();
    res.render("productList", { product: products, categories: categories });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deleteId = req.query.id;

    await Product.findByIdAndUpdate(deleteId, { status: false });
    const products = await Product.find();

    const categories = await Category.find();
    res.render("productList", { product: products, categories: categories });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId")
      .populate("addressId")
      .populate("products.productId")
      .sort({ orderedDate: -1 });
    console.log("orders", orders);
    res.render("orders", { orders: orders });
  } catch (error) {
    console.log(error);
    const errorMessage = "internal Servor Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const viewOrders = async (req, res) => {
  const orderId = req.query.id;

  try {
    const order = await Order.findOne({ _id: orderId }).populate("userId");

    res.render("viewOrders", { order: order });
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const statusOrders = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const option = req.body.selectedOption;

    const orders = await Order.findByIdAndUpdate(orderId, { status: option });

    res.status(200).json({ redirect: "/admin/view-orders?id=" + orderId });
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const loadCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isCoupon: true });

    res.render("coupon", { coupons: coupons, message: undefined });
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};
const insertCoupon = async (req, res) => {
  try {
    couponCode = req.body.code;
    couponDescription = req.body.description;
    (couponDiscount = req.body.discount), (couponExpiry = req.body.exp);

    maximumAmount = req.body.max;
    minimumAmount = req.body.min;

    let coupons = await Coupon.findOne({ couponCode: req.body.code });
    if (coupons) {
      const coupons = await Coupon.find({ isCoupon: true });
      res.render("coupon", {
        coupons: coupons,
        message: "Code is already exist",
      });
    } else {
      const coupon = new Coupon({
        couponCode: couponCode,
        couponDescription: couponDescription,
        couponDiscount: couponDiscount,
        couponExpiry: couponExpiry,
        maximumAmount: maximumAmount,
        minimumAmount: minimumAmount,
      });
      await coupon.save();
      console.log("coupon", coupon);

      res.redirect("/admin/add-coupon");
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const editCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;

    const coupon = await Coupon.findOne({ _id: couponId });

    res.render("editCoupon", { coupon: coupon, message: undefined });
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};
const insertEditedCoupon = async (req, res) => {
  try {
    let couponId = req.body.id;
    let couponCode = req.body.code;
    let couponDescription = req.body.description;
    let couponDiscount = req.body.discount;
    // Assuming req.body.exp is in the format 'MM/DD/YYYY'
    let dateParts = req.body.exp.split("/"); // Split the date string into parts

    // Extract year, month, and day from the date string parts
    let year = parseInt(dateParts[2]); // Extract year
    let month = parseInt(dateParts[0]) - 1; // Extract month (subtract 1 because months are zero-based)
    let day = parseInt(dateParts[1]); // Extract day

    // Create a new Date object using the extracted components (year, month, day)
    let couponExpiry = new Date(year, month, day);

    let maximumAmount = req.body.max;
    let minimumAmount = req.body.min;
    let coupons = await Coupon.findOne({ couponCode: couponCode });
    if (coupons) {
      const coupon = await Coupon.findOne({ _id: couponId });
      res.render("editCoupon", {
        coupon: coupon,
        message: "code is already exist",
      });
    } else {
      const coupon = await Coupon.findByIdAndUpdate(couponId, {
        couponCode: couponCode,
        couponDescription: couponDescription,
        couponDiscount: couponDiscount,
        couponExpiry: couponExpiry,
        maximumAmount: maximumAmount,
        minimumAmount: minimumAmount,
      });

      res.redirect("/admin/add-coupon");
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};
const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;
    // objectCouponId = mongoose.Types.ObjectId(couponId);

    const coupons = await Coupon.findByIdAndUpdate(couponId, {
      isCoupon: false,
    });
    res.redirect("/admin/add-coupon");
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const categoryOffer = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("categoryOffer", { categories: categories });
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const addCategoryOffer = async (req, res) => {
  try {
    const name = req.body.name;
    const offer = req.body.offer;
    const category = await Category.findOne({ name: name });

    if (category) {
      const categoryData = await Category.findOneAndUpdate(
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

      // const products = await Product.find()
      //     const products = await Product.aggregate([
      //         {
      //           $lookup: {
      //             from: "categories",
      //             localField: "category",
      //             foreignField: "name",
      //             as: "result",
      //           },
      //         },
      //         {
      //           $project:
      //             {
      //               _id: 1,
      //               name: 1,
      //               price: 1,
      //               disprice:1,
      //               discount: 1,
      //               image: 1,
      //               date: 1,
      //               color: 1,
      //               stock: 1,
      //               sizes: 1,
      //               status: 1,
      //               category: 1,
      //               createdAt: 1,
      //               categoryOffer: { $arrayElemAt: ["$result.offer", 0] },
      //             },
      //         },
      //       ])

      //     console.log("products",products);

      //    products.forEach((product)=>{
      //     if(product.categoryOffer>product.discount){
      //         product.disprice = product.price-(product.categoryOffer/100)*product.price
      //         console.log(product.disprice);
      //     }
      //    })

      const categories = await Category.find();
      res.render("categoryOffer", { categories: categories });
    } else {
      const categories = await Category.find();
      res.render("categoryOffer", {
        categories: categories,
        message: "No categories exist",
      });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const salesReport = async (req, res) => {
  try {
    const orders = await Order.find({ status: "delivered" }).populate("userId");
    const status = await Order.find({ status: "delivered" }).count();

    let orderOriginalPrice = 0;
    let orderDiscountPrice = 0;
    orders.forEach((order) => {
      orderOriginalPrice += parseInt(order.totalPrice);
      if (order.discountTotal) {
        orderDiscountPrice += parseInt(order.discountTotal);
      } else {
        orderDiscountPrice += parseInt(order.wcTotal);
      }
    });

    totalDiscount = orderOriginalPrice - orderDiscountPrice;

    res.render("salesReport", {
      orders: orders,
      orderOriginalPrice: orderOriginalPrice,
      orderDiscountPrice: orderDiscountPrice,
      totalDiscount,
    });
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

module.exports = {
  adminRegister,
  verifyRegister,
  adminLogin,
  adminForgot,
  loadLogout,
  adminDashboard,
  ListProduct,
  productCategories,
  addProduct,
  adminVerify,
  userList,
  userBlock,
  insertCategories,
  editCategories,
  deleteCategories,
  editCategories,
  updateCategories,
  insertProduct,
  editProduct,
  insertEditedProduct,
  deleteProduct,
  listOrders,
  viewOrders,
  statusOrders,
  loadCoupon,
  insertCoupon,
  editCoupon,
  deleteCoupon,
  insertEditedCoupon,
  categoryOffer,
  addCategoryOffer,
  salesReport,
};
