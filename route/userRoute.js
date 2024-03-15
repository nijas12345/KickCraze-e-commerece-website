const express = require('express')
const userRoute = express()
const path = require('path')


userRoute.set("view engine","ejs")
userRoute.set('views',path.join(__dirname,"../views/user"))
const bodyparser = require("body-parser")
userRoute.use(bodyparser.json())
userRoute.use(bodyparser.urlencoded({extended:true}))

const userController = require ('../Controller/userController')
const Auth = require("../middleware/userAuth")

// user Registration
userRoute.get('/register',userController.loadRegister)
userRoute.post('/register',userController.insertUser)
userRoute.get("/loadOtp",userController.loadOtp)
userRoute.get('/registerOtp',userController.registerOtp)
userRoute.post('/registerOtp',userController.verifyRegister)

//user Login

userRoute.get('/login',Auth.requireAuth1,userController.loadLogin)
userRoute.post('/login',userController.verifyUser)


//user Logout

userRoute.get("/logout",userController.loadLogout)

userRoute.get('/loginotp',userController.loadOtp)
userRoute.get('/forgotPassword',userController.forgotPassword)

//user home

userRoute.get('/home',Auth.requireAuth,userController.loadHome)
userRoute.get('/product-profile',Auth.requireAuth,userController.productProfile)

//user shop

userRoute.get('/shop',userController.loadShop)



module.exports = userRoute