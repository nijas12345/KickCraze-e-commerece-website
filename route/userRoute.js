const express = require('express')
const userRoute = express()
const path = require('path')


userRoute.set("view engine","ejs")
userRoute.set('views',path.join(__dirname,"../views/user"))
const bodyparser = require("body-parser")
userRoute.use(bodyparser.json())
userRoute.use(bodyparser.urlencoded({extended:true}))

const userController = require ('../Controller/userController')
const cartController = require("../Controller/cartController")
const dashboardController = require('../Controller/dashboardController')
const orderController = require('../Controller/orderController')
const Auth = require("../middleware/userAuth")

// user Registration

userRoute.get('/register',userController.loadRegister)
userRoute.post('/register',userController.insertUser)
userRoute.get("/loadOtp",userController.loadOtp)
userRoute.get('/registerOtp',userController.registerOtp)
userRoute.post('/registerOtp',userController.verifyRegister)

//google login

userRoute.get("/verify-google",userController.verifyGoogle)


//user Login

userRoute.get('/login',userController.loadLogin)
userRoute.post('/login',userController.verifyUser)


//user Logout

userRoute.get("/logout",userController.loadLogout)

userRoute.get('/loginotp',userController.loadOtp)
userRoute.get('/forgotPassword',userController.forgotPassword)

//user home

userRoute.get('/home',Auth.requireAuth,userController.loadHome)
userRoute.get('/product-profile',Auth.requireAuth,userController.productProfile)


userRoute.get('/userProfile',Auth.requireAuth,dashboardController.userProfile)
userRoute.post('/add-address',Auth.requireAuth,dashboardController.addAddress)
userRoute.post('/add-edit',Auth.requireAuth,dashboardController.addEdit)
userRoute.post("/userProfile-edit",Auth.requireAuth,dashboardController.editUserProfile)
userRoute.get("/delete-address",Auth.requireAuth,dashboardController.deleteAddres)

//usercart

userRoute.get('/cart',Auth.requireAuth,cartController.loadCart)
userRoute.post('/insert-cart',Auth.requireAuth,cartController.insertCart)
userRoute.post("/update-quantity",Auth.requireAuth,cartController.updateCart)


userRoute.post("/delete-cart",Auth.requireAuth,cartController.deleteCart)
userRoute.get("/checkout",Auth.requireAuth,cartController.checkOut)


//userorder
userRoute.get("/order-success",Auth.requireAuth,orderController.loadSuccess)
userRoute.post("/order-insert",Auth.requireAuth,orderController.insertOrder)
userRoute.get("/delete-order",Auth.requireAuth,orderController.deleteOrder)


//user shop

userRoute.get('/shop',Auth.requireAuth,userController.loadShop)
userRoute.post("/search",Auth.requireAuth,userController.loadSearch)
userRoute.get("/sort-alphabet-a-z",Auth.requireAuth,userController.loadSortAZ)
userRoute.get("/sort-alphabet-z-a",Auth.requireAuth,userController.loadSortZA)
userRoute.get("/sort-high-to-low",Auth.requireAuth,userController.highToLow)
userRoute.get("/sort-low-to-high",Auth.requireAuth,userController.lowToHigh)
userRoute.get("/sort-new-arrivals",Auth.requireAuth,userController.newArrivals)



module.exports = userRoute