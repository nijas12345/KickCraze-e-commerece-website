const express = require("express");
const userRoute = express();
const path = require("path");
require("../middleware/auth");
const passport = require("passport");

userRoute.set("view engine", "ejs");
userRoute.set("views", path.join(__dirname, "../views/user"));
const bodyparser = require("body-parser");
userRoute.use(bodyparser.json());
userRoute.use(bodyparser.urlencoded({ extended: true }));

const userController = require("../Controller/userController");
const cartController = require("../Controller/cartController");
const dashboardController = require("../Controller/dashboardController");
const orderController = require("../Controller/orderController");
const wishListController = require('../Controller/wishListController');
const sortController = require('../Controller/sortController');
const productController = require('../Controller/productController');
const searchController = require('../Controller/searchController');
const shopController = require('../Controller/shopController')
const categoryController = require('../Controller/categoryController')
const orderStatusController = require('../Controller/orderStatusController');
const orderFailureController = require('../Controller/orderFailureController');
const homeController = require('../Controller/homeController');
const Auth = require("../middleware/userAuth");

// user Registration
userRoute.get("/", homeController.loadHome);
userRoute.get("/register", userController.loadRegister);
userRoute.post("/register", userController.insertUser);
userRoute.get("/loadOtp", userController.loadOtp);
userRoute.get("/registerOtp", userController.registerOtp);
userRoute.post("/registerOtps", userController.verifyRegister);

//google login
userRoute.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRoute.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  userController.verifyGoogle
);

//user Login

userRoute.get("/login", userController.loadLogin);
userRoute.post("/login", userController.verifyUser);

//user Logout

userRoute.get("/logout", userController.loadLogout);

userRoute.get("/loginotp", userController.loadOtp);
userRoute.get("/forgotPassword", userController.forgotPassword);
userRoute.post("/forgot-email", userController.forgotEmail);
userRoute.get("/verify-otp", userController.verifyOtp);
userRoute.post("/verify-otp", userController.insertOtp);
userRoute.get("/confirmation", userController.confirmation);
userRoute.post("/confirm-password", userController.confirmPassword);

//user home

userRoute.get("/home", Auth.requireAuth, homeController.loadHome);
userRoute.get(
  "/product-profile",
  Auth.jwtVerify,
  productController.productProfile
);

//wishlist
userRoute.post(
  "/insert-wishlist",
  Auth.requireAuth,
  wishListController.insertWishlist
);
userRoute.get(
  "/show-wishlist",
  Auth.requireAuth,
  Auth.isBlocked,
  wishListController.showWishlist
);
userRoute.get(
  "/wishlist-remove",
  Auth.requireAuth,
  Auth.isBlocked,
  wishListController.removeWishlist
);

userRoute.get(
  "/userProfile",
  Auth.requireAuth,
  Auth.isBlocked,
  dashboardController.userProfile
);
userRoute.post(
  "/add-address",
  Auth.requireAuth,
  Auth.isBlocked,
  dashboardController.addAddress
);
userRoute.post(
  "/add-edit",
  Auth.requireAuth,
  Auth.isBlocked,
  dashboardController.addEdit
);
userRoute.put(
  "/userProfile-edit",
  Auth.requireAuth,
  Auth.isBlocked,
  dashboardController.editUserProfile
);
userRoute.get(
  "/delete-address",
  Auth.requireAuth,
  Auth.isBlocked,
  dashboardController.deleteAddres
);
userRoute.put(
  "/change-password",
  Auth.requireAuth,
  Auth.isBlocked,
  dashboardController.changePassword
);
userRoute.get(
  "/delete-account",
  Auth.requireAuth,
  Auth.isBlocked,
  dashboardController.deleteUser
);

//usercart

userRoute.get(
  "/cart",
  Auth.requireAuth,
  Auth.isBlocked,
  cartController.loadCart
);
userRoute.post(
  "/insert-cart",
  Auth.requireAuth,
  Auth.isBlocked,
  cartController.insertCart
);
userRoute.put(
  "/update-quantity",
  Auth.requireAuth,
  Auth.isBlocked,
  cartController.updateCart
);

userRoute.put(
  "/delete-cart",
  Auth.requireAuth,
  Auth.isBlocked,
  cartController.deleteCart
);
userRoute.get(
  "/clear-cart",
  Auth.requireAuth,
  Auth.isBlocked,
  cartController.clearCart
);
userRoute.get(
  "/checkout",
  Auth.requireAuth,
  Auth.isBlocked,
  cartController.checkOut
);

//userorder
userRoute.get(
  "/order-success",
  Auth.requireAuth,
  Auth.isBlocked,
  orderController.loadSuccess
);
userRoute.post(
  "/online-insert",
  Auth.requireAuth,
  Auth.isBlocked,
  orderController.onlineOrder
);
userRoute.put(
  "/wallet-insert",
  Auth.requireAuth,
  Auth.isBlocked,
  orderController.walletPayment
);
userRoute.post(
  "/online-success",
  Auth.requireAuth,
  Auth.isBlocked,
  orderController.onlineSuccess
);
userRoute.post(
  "/failed",
  Auth.requireAuth,
  Auth.isBlocked,
  orderFailureController.failureOrder
);
userRoute.get(
  "/order-unSuccess",
  Auth.requireAuth,
  Auth.isBlocked,
  orderFailureController.loadUnSuccess
);
// userRoute.get('/order-pending',Auth.requireAuth,Auth.isBlocked,orderController.orderPending)
userRoute.post(
  "/order-insert",
  Auth.requireAuth,
  Auth.isBlocked,
  orderController.insertOrder
);
userRoute.get(
  "/view-order",
  Auth.requireAuth,
  Auth.isBlocked,
  orderStatusController.viewOrder
);
userRoute.put(
  "/cancel-order",
  Auth.requireAuth,
  Auth.isBlocked,
  orderStatusController.cancelOrder
);
userRoute.put(
  "/return-order",
  Auth.requireAuth,
  Auth.isBlocked,
  orderStatusController.returnOrder
);

//coupon
userRoute.put(
  "/apply-coupon",
  Auth.requireAuth,
  Auth.isBlocked,
  cartController.applyCoupon
);

userRoute.put(
  "/remove-coupon",
  Auth.requireAuth,
  Auth.isBlocked,
  cartController.removeCoupon
);

//user shop

userRoute.get(
  "/shop",
  Auth.requireAuth,
  Auth.isBlocked,
  shopController.loadShop
);
userRoute.post(
  "/search",
  Auth.requireAuth,
  Auth.isBlocked,
  searchController.loadSearch
);
userRoute.post(
  "/search-input",
  Auth.requireAuth,
  Auth.isBlocked,
  searchController.SearchInput
);
userRoute.get(
  "/sort-alphabet-a-z",
  Auth.requireAuth,
  Auth.isBlocked,
  sortController.loadSortAZ
);
userRoute.get(
  "/sort-alphabet-z-a",
  Auth.requireAuth,
  Auth.isBlocked,
  sortController.loadSortZA
);
userRoute.get(
  "/sort-high-to-low",
  Auth.requireAuth,
  Auth.isBlocked,
  sortController.highToLow
);
userRoute.get(
  "/sort-low-to-high",
  Auth.requireAuth,
  Auth.isBlocked,
  sortController.lowToHigh
);
userRoute.get(
  "/sort-new-arrivals",
  Auth.requireAuth,
  Auth.isBlocked,
  sortController.newArrivals
);

userRoute.get(
  "/sports-shoes",
  Auth.requireAuth,
  Auth.isBlocked,
  categoryController.sportShoe
);

module.exports = userRoute;
