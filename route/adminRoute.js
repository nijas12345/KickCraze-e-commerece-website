const express = require('express')
const adminRoute = express()
const path = require('path')
const adminController = require('../Controller/adminController')
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
const upload = multer({storage:storage})
adminRoute.set("view engine","ejs")
adminRoute.set('views',path.join(__dirname,"../views/admin"))


//login

adminRoute.get('/login',adminController.adminLogin)
adminRoute.post('/login',adminController.adminVerify)
adminRoute.get('/forgot',adminController.adminForgot)
adminRoute.get('/dashboard',adminController.adminDashboard)

//logout



//user Management

adminRoute.get('/user-list',adminController.userList)
adminRoute.get('/user-unblock',adminController.userUnblock)
adminRoute.get('/user-block',adminController.userBlock)


//categories
adminRoute.get('/product-categories',adminController.productCategories)
adminRoute.post('/product-categories',adminController.insertCategories)
adminRoute.get('/categories-edit',adminController.editCategories)
adminRoute.get('/categories-delete',adminController.deleteCategories)
adminRoute.post('/update-categories',adminController.updateCategories)

//product list

adminRoute.get('/product-list',adminController.ListProduct)
adminRoute.get('/add-product',adminController.addProduct)
adminRoute.post('/add-product',upload.array('image'),adminController.insertProduct)
adminRoute.get('/product-edit',adminController.editProduct)

adminRoute.post('/product-edit',adminController.insertEditedProduct)
adminRoute.get("/product-delete",adminController.deleteProduct)

module.exports = adminRoute