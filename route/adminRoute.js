const express = require('express')
const adminRoute = express()
const path = require('path')
const adminController = require('../Controller/adminController')
const auth = require("../middleware/adminAuth")
const multer = require("multer")

const storage = multer.diskStorage({
    destination:function(req,filename,cb){
        cb(null,path.join(__dirname,"../public/productImages"))
    },
    filename:function(req,file,cb){
       const name = Date.now()+"-"+file.originalname;
       cb(null,name)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
     
      cb(null, true); 
    }
  });
  
adminRoute.set("view engine","ejs")
adminRoute.set('views',path.join(__dirname,"../views/admin"))



//login

adminRoute.get('/login',auth.adminAuth1,adminController.adminLogin)
adminRoute.post('/login',adminController.adminVerify)
adminRoute.get('/forgot',adminController.adminForgot)
adminRoute.get('/dashboard',auth.adminAuth,adminController.adminDashboard)

//register

adminRoute.get("/signup",adminController.adminRegister)
adminRoute.post("/signup",adminController.verifyRegister)
//logout

adminRoute.get('/logout',adminController.loadLogout)

//user Management

adminRoute.get('/user-list',auth.adminAuth,adminController.userList)
adminRoute.get('/user-block',auth.adminAuth,adminController.userBlock)


//categories
adminRoute.get('/product-categories',auth.adminAuth,adminController.productCategories)
adminRoute.post('/product-categories',auth.adminAuth,adminController.insertCategories)
adminRoute.get('/categories-edit',auth.adminAuth,adminController.editCategories)
adminRoute.get('/categories-delete',adminController.deleteCategories)
adminRoute.post('/update-categories',adminController.updateCategories)

//product list

adminRoute.get('/product-list',auth.adminAuth,adminController.ListProduct)
adminRoute.get('/add-product',auth.adminAuth,adminController.addProduct)
adminRoute.post('/add-products',upload.any(),adminController.insertProduct)
adminRoute.get('/product-edit',auth.adminAuth,adminController.editProduct)

adminRoute.post('/product-edit',auth.adminAuth,adminController.insertEditedProduct)
adminRoute.get("/product-delete",auth.adminAuth,adminController.deleteProduct)

//orders

adminRoute.get('/order-list',auth.adminAuth,adminController.listOrders)
adminRoute.get('/cancel-orders',auth.adminAuth,adminController.cancelOrders)
adminRoute.post('/status-update',auth.adminAuth,adminController.statusOrders)

module.exports = adminRoute