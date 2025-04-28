const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const Product = require("../model/productModel");
const Address = require("../model/addressModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Order = require("../model/orderModel");
const wishlist = require("../model/wishlistModel");
const Wallet = require("../model/walletModel");
const Category = require("../model/categoryModel");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

const userProfile = async (req, res) => {
  try {
    const userId = req.id;

    const address = await Address.find({ userId: userId });
    const user = await User.findOne({ _id: userId });

    const orders = await Order.find({ userId: userId })
      .populate("products.productId")
      .sort({ orderedDate: -1 });
    console.log("orders", orders);

    const orderCount = await Order.findOne({ userId: userId }).countDocuments();
    const orderPending = await Order.findOne({
      userId: userId,
      status: "pending",
    }).countDocuments();

    const wishlistData = await wishlist
      .find({ userId: userId })
      .populate("userId")
      .populate("productId");
    const wishlistCount = await wishlist
      .find({ userId: userId })
      .countDocuments();

    const wallets = await Wallet.findOne({ userId: userId });

    const categories = await Category.find({ delete: true });

    let creditedAmount = 0;
    let debitedAmount = 0;
    if (wallets) {
      wallets.details.forEach((wallet) => {
        if (wallet.transactionType == "Credited") {
          creditedAmount += wallet.amount;
        } else {
          debitedAmount += wallet.amount;
        }
      });
    }

    totalAmount = creditedAmount - debitedAmount;
    console.log("wallets ", wallets);

    console.log("orders", orders);
    res.render("userProfile", {
      addressData: address,
      user: user,
      orders: orders,
      wishlistData: wishlistData,
      totalAmount: totalAmount,
      wallets: wallets,
      categories: categories,
      orderCount: orderCount,
      wishlistCount: wishlistCount,
      orderPending: orderPending,
    });
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};
const addAddress = async (req, res) => {
  try {
    console.log(req.body);
    const userId = req.id;
    const zip = req.body.pin;
    console.log("hai666");
    const address = new Address({
      userId: userId,
      name: req.body.name,
      state: req.body.state,
      houseName: req.body.housename,
      pin: zip,
      mobile: req.body.mobile,
    });

    await address.save();
    console.log("adres", address);
    res.redirect("/userProfile");
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const addEdit = async (req, res) => {
  try {
    console.log("req", req.body);
    const id = req.body.id;
    const address = await Address.findByIdAndUpdate(id, {
      name: req.body.name,
      state: req.body.state,
      pin: req.body.zip,
      houseName: req.body.housename,
      mobile: req.body.mobile,
    });

    res.redirect("/userProfile");
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const deleteAddres = async (req, res) => {
  try {
    const addressId = req.query.id;

    const address = await Address.findByIdAndUpdate(addressId, {
      isAddress: false,
    });
    res.redirect("/userProfile");
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const editUserProfile = async (req, res) => {
  try {
    const id = req.id;
    const { name, email, mobile } = req.body;
    const user = await User.findOne({ email: email });

    if (user) {
      res.status(200).json({ success: false });
    }
    const userData = await User.findByIdAndUpdate(id, {
      name: name,
      email: email,
      mobile: mobile,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const changePassword = async (req, res) => {
  try {
    console.log(req.body);
    const userId = req.id;
    console.log("userId", userId);
    let oldPassword = req.body.oldPassword;
    const user = await User.findOne({ _id: userId });
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (passwordMatch) {
      const spassword = await securePassword(oldPassword);
      const userData = await User.findByIdAndUpdate(userId, {
        password: spassword,
      });
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.id;
    res.clearCookie("jwt");
    const user = await User.deleteOne({ _id: userId });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

module.exports = {
  userProfile,
  addAddress,
  addEdit,
  deleteAddres,
  editUserProfile,
  changePassword,
  deleteUser,
};
