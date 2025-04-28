const express = require("express");
const adminRoute = express();
const path = require("path");
const adminController = require("../Controller/adminController");
const auth = require("../middleware/adminAuth");
const orderController = require("../Controller/orderController");

const multerStorage = require("../helpers/multerStorage");

adminRoute.set("view engine", "ejs");
adminRoute.set("views", path.join(__dirname, "../views/admin"));

//login

adminRoute.get("/login", auth.adminAuth1, adminController.adminLogin);
adminRoute.post("/login", adminController.adminVerify);
adminRoute.get("/forgot", adminController.adminForgot);
adminRoute.get("/dashboard", auth.adminAuth, adminController.adminDashboard);

//register

adminRoute.get("/signup", adminController.adminRegister);
adminRoute.post("/signup", adminController.verifyRegister);
//logout

adminRoute.get("/logout", adminController.loadLogout);

//user Management

adminRoute.get("/user-list", auth.adminAuth, adminController.userList);
adminRoute.get("/user-block", auth.adminAuth, adminController.userBlock);

//categories
adminRoute.get(
  "/product-categories",
  auth.adminAuth,
  adminController.productCategories
);
adminRoute.post(
  "/product-categories",
  auth.adminAuth,
  adminController.insertCategories
);
adminRoute.get(
  "/categories-edit",
  auth.adminAuth,
  adminController.editCategories
);
adminRoute.get("/categories-delete", adminController.deleteCategories);
adminRoute.put("/update-categories", adminController.updateCategories);

//product list

adminRoute.get("/product-list", auth.adminAuth, adminController.ListProduct);
adminRoute.get("/add-product", auth.adminAuth, adminController.addProduct);
adminRoute.post(
  "/add-products",
  multerStorage.any(),
  adminController.insertProduct
);
adminRoute.get("/product-edit", auth.adminAuth, adminController.editProduct);

adminRoute.post(
  "/product-edit",
  multerStorage.any(),
  adminController.insertEditedProduct
);
adminRoute.get(
  "/product-delete",
  auth.adminAuth,
  adminController.deleteProduct
);

// coupond

adminRoute.get("/add-coupon", auth.adminAuth, adminController.loadCoupon);
adminRoute.post("/add-coupon", auth.adminAuth, adminController.insertCoupon);
adminRoute.get("/edit-coupon", auth.adminAuth, adminController.editCoupon);
adminRoute.post(
  "/edit-coupon",
  auth.adminAuth,
  adminController.insertEditedCoupon
);
adminRoute.get("/delete-coupon", auth.adminAuth, adminController.deleteCoupon);

//orders

adminRoute.get("/order-list", auth.adminAuth, adminController.listOrders);
adminRoute.get("/view-orders", auth.adminAuth, adminController.viewOrders);

adminRoute.put("/status-update", auth.adminAuth, adminController.statusOrders);

//category

adminRoute.get(
  "/category-offer",
  auth.adminAuth,
  adminController.categoryOffer
);
adminRoute.post("/add-offer", auth.adminAuth, adminController.addCategoryOffer);

//salesReport

adminRoute.get("/sales-report", auth.adminAuth, adminController.salesReport);

adminRoute.post("/day-sales", auth.adminAuth, orderController.daySales);

module.exports = adminRoute;
