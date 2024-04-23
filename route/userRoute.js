const express = require('express')
const userRoute = express()
const path = require('path')
require("../middleware/auth")
const passport = require("passport")



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
userRoute.post('/registerOtps',userController.verifyRegister)

//google login

userRoute.get('/auth/google',passport.authenticate("google",{scope:['email','profile']}))
userRoute.get('/auth/google/callback',passport.authenticate("google",{ successRedirect:"/verify-google",failureRedirect:"/login"}))
userRoute.get("/verify-google",userController.verifyGoogle)



//user Login

userRoute.get('/login',userController.loadLogin)
userRoute.post('/login',userController.verifyUser)


//user Logout

userRoute.get("/logout",userController.loadLogout)

userRoute.get('/loginotp',userController.loadOtp)
userRoute.get('/forgotPassword',userController.forgotPassword)

//user home

userRoute.get('/home',Auth.requireAuth,Auth.isBlocked,userController.loadHome)
userRoute.get('/product-profile',Auth.requireAuth,Auth.isBlocked,userController.productProfile)

//wishlist
userRoute.post('/insert-wishlist',Auth.requireAuth,Auth.isBlocked,userController.insertWishlist)
userRoute.get('/show-wishlist',Auth.requireAuth,Auth.isBlocked,userController.showWishlist)
userRoute.get('/wishlist-remove',Auth.requireAuth,Auth.isBlocked,userController.removeWishlist)


userRoute.get('/userProfile',Auth.requireAuth,Auth.isBlocked,dashboardController.userProfile)
userRoute.post('/add-address',Auth.requireAuth,Auth.isBlocked,dashboardController.addAddress)
userRoute.put('/add-edit',Auth.requireAuth,Auth.isBlocked,dashboardController.addEdit)
userRoute.put("/userProfile-edit",Auth.requireAuth,Auth.isBlocked,dashboardController.editUserProfile)
userRoute.get("/delete-address",Auth.requireAuth,Auth.isBlocked,dashboardController.deleteAddres)

//usercart

userRoute.get('/cart',Auth.requireAuth,Auth.isBlocked,cartController.loadCart)
userRoute.post('/insert-cart',Auth.requireAuth,Auth.isBlocked,cartController.insertCart)
userRoute.put("/update-quantity",Auth.requireAuth,Auth.isBlocked,cartController.updateCart)




userRoute.put("/delete-cart",Auth.requireAuth,Auth.isBlocked,cartController.deleteCart)
userRoute.get("/checkout",Auth.requireAuth,Auth.isBlocked,cartController.checkOut)


//userorder
userRoute.get("/order-success",Auth.requireAuth,Auth.isBlocked,orderController.loadSuccess)
userRoute.post('/online-insert',Auth.requireAuth,Auth.isBlocked,orderController.onlineOrder)
userRoute.put('/wallet-insert',Auth.requireAuth,Auth.isBlocked,orderController.walletPayment)
userRoute.post('/online-success',Auth.requireAuth,Auth.isBlocked,orderController.onlineSuccess)
userRoute.post('/failed',Auth.requireAuth,Auth.isBlocked,orderController.failureOrder)
userRoute.get('/order-unSuccess',Auth.requireAuth,Auth.isBlocked,orderController.loadUnSuccess)
// userRoute.get('/order-pending',Auth.requireAuth,Auth.isBlocked,orderController.orderPending)
userRoute.post("/order-insert",Auth.requireAuth,Auth.isBlocked,orderController.insertOrder)
userRoute.get("/view-order",Auth.requireAuth,Auth.isBlocked,orderController.viewOrder)
userRoute.put('/cancel-order',Auth.requireAuth,Auth.isBlocked,orderController.cancelOrder)
userRoute.put('/return-order',Auth.requireAuth,Auth.isBlocked,orderController.returnOrder)


//coupon
userRoute.put('/apply-coupon',Auth.requireAuth,Auth.isBlocked,cartController.applyCoupon)

userRoute.put('/remove-coupon',Auth.requireAuth,Auth.isBlocked,cartController.removeCoupon)



//user shop

userRoute.get('/shop',Auth.requireAuth,Auth.isBlocked,userController.loadShop)
userRoute.post("/search",Auth.requireAuth,Auth.isBlocked,userController.loadSearch)
userRoute.post('/search-input',Auth.requireAuth,Auth.isBlocked,userController.SearchInput)
userRoute.get("/sort-alphabet-a-z",Auth.requireAuth,Auth.isBlocked,userController.loadSortAZ)
userRoute.get("/sort-alphabet-z-a",Auth.requireAuth,Auth.isBlocked,userController.loadSortZA)
userRoute.get("/sort-high-to-low",Auth.requireAuth,Auth.isBlocked,userController.highToLow)
userRoute.get("/sort-low-to-high",Auth.requireAuth,Auth.isBlocked,userController.lowToHigh)
userRoute.get("/sort-new-arrivals",Auth.requireAuth,Auth.isBlocked,userController.newArrivals)


//category

userRoute.get('/sports-shoes',Auth.requireAuth,Auth.isBlocked,userController.sportShoe)






module.exports = userRoute