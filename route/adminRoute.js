const express = require("express");
const adminRoute = express();
const path = require("path");
const adminController = require("../Controller/adminController");
const auth = require("../middleware/adminAuth");
const categoryController = require('../Controller/categoryController')
const productController = require('../Controller/productController')
const couponController = require('../Controller/couponController')
const dashboardController = require('../Controller/dashboardController')
const salesController = require('../Controller/salesController');
const userOrderController = require('../Controller/userOrderController')

const multerStorage = require("../helpers/multerStorage");
adminRoute.set("view engine", "ejs");
adminRoute.set("views", path.join(__dirname, "../views/admin"));

//login

adminRoute.get("/login", auth.adminAuth1, adminController.adminLogin);
adminRoute.post("/login", adminController.adminVerify);
adminRoute.get("/forgot", adminController.adminForgot);
adminRoute.get("/dashboard", auth.adminAuth, dashboardController.adminDashboard);

//register

adminRoute.get("/signup", adminController.adminRegister);
adminRoute.post("/signup", adminController.verifyRegister);
//logout

adminRoute.get("/logout", adminController.loadLogout);

//user Management

adminRoute.get("/user-list", auth.adminAuth, adminController.userList);
adminRoute.put("/user-block", auth.adminAuth, adminController.userBlock);

//categories
adminRoute.get(
  "/product-categories",
  auth.adminAuth,
  categoryController.productCategories
);
adminRoute.post(
  "/product-categories",
  auth.adminAuth,
  categoryController.insertCategories
);
adminRoute.get(
  "/categories-edit",
  auth.adminAuth,
  categoryController.editCategories
);
adminRoute.get("/categories-delete", categoryController.deleteCategories);
adminRoute.put("/update-categories", categoryController.updateCategories);

//product list

adminRoute.get("/product-list", auth.adminAuth, productController.ListProduct);
adminRoute.get("/add-product", auth.adminAuth, productController.addProduct);
adminRoute.post(
  "/add-products",
  multerStorage.any(),
  productController.insertProduct
);
adminRoute.get("/product-edit", auth.adminAuth, productController.editProduct);

adminRoute.post(
  "/product-edit",
  multerStorage.any(),
  productController.insertEditedProduct
);
adminRoute.get(
  "/product-delete",
  auth.adminAuth,
  productController.deleteProduct
);

// coupond

adminRoute.get("/add-coupon", auth.adminAuth, couponController.loadCoupon);
adminRoute.post("/add-coupon", auth.adminAuth, couponController.insertCoupon);
adminRoute.get("/edit-coupon", auth.adminAuth, couponController.editCoupon);
adminRoute.post(
  "/edit-coupon",
  auth.adminAuth,
  couponController.insertEditedCoupon
);
adminRoute.get("/delete-coupon", auth.adminAuth, couponController.deleteCoupon);


adminRoute.get("/order-list", auth.adminAuth, userOrderController.listOrders);
adminRoute.get("/view-orders", auth.adminAuth, userOrderController.viewOrders);
adminRoute.put("/status-update", auth.adminAuth, userOrderController.statusOrders);


adminRoute.get(
  "/category-offer",
  auth.adminAuth,
  categoryController.categoryOffer
);
adminRoute.post("/add-offer", auth.adminAuth, categoryController.addCategoryOffer);

//salesReport

adminRoute.get("/sales-report", auth.adminAuth, salesController.salesReport);

adminRoute.post("/day-sales", auth.adminAuth, salesController.daySales);

module.exports = adminRoute;
