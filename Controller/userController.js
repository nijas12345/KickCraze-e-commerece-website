const User = require('../model/userModel')
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const Product = require('../model/productModel')
const Address = require("../model/addressModel")
const Cart = require("../model/cartModel")



const createToken = (user)=>{
    const JWT_SECRET = process.env.JWT_SECRET
    return jwt.sign(user,JWT_SECRET,{expiresIn:"1h"})
}


const securePassword = async (password)=>{
    try {
      const passwordHash = await bcrypt.hash(password,10)
      return passwordHash
    } catch (error) {
        console.log(error);
    }
}



const loadRegister = async (req,res)=>{
    
    try {
        res.render("register")
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}

const insertUser = async(req,res)=>{
    try {
        const checkEmail = await User.findOne({email:req.body.email})
        if(checkEmail){
            res.status(200).render("register",{message:"Email already exists"})
        }   
        else{
            const spassword = await securePassword(req.body.pass)
            const users = {
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mno,
                password:spassword,
                    
            }
            req.session.temp = users
          
            res.redirect('/loadOtp')
        }    
        }
       
     catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}

const loadOtp = async (req,res)=>{
    try {
       
        const email = req.session.temp.email;
        let otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        req.session.otp = otpCode;
        console.log(otpCode);
        
        console.log(email);
        console.log(process.env.USER_PASSWORD);
        const transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.USER_NAME,
                pass:process.env.USER_PASSWORD
            },
            tls:{
               rejectUnauthorized:false
            }
        })
        const mailOptions = {
            from : process.env.USER_NAME,
            to : email,
            subject :"Verification Code",
            text :`Your OTP code is ${otpCode}`
        };
         transporter.sendMail(mailOptions,function(err,info){
            if(err){
                console.error("Error sending mail ",err)
                const statusCode = 500;
                const errorMessage = "Failed to send OTP mail"
                res.status(statusCode).render("errorPage",{statusCode,errorMessage})
                return otpCode
            }
            else{
                
                console.log("Email sent:" +info.response)
                res.redirect("/registerOtp")
            }
         })
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const verifyRegister = async(req,res)=>{

    
    try {
        
        let OTPs = req.body.OTP
    
         var loadOtp = req.session.otp
         console.log(loadOtp);
        if(loadOtp === OTPs){
            let cust = req.session.temp
            const user = new User({
               name:cust.name,
               email:cust.email,
               mobile:cust.mobile,
               password:cust.password,
               status :1,
            })
          
            const userData = await user.save()
            if(userData){
               const token = createToken({id:userData._id})
               res.cookie("jwt",token,{httpOnly:true,maxAge:60000000})
               console.log(token)
               res.redirect('/home')
            }   
        }
        else{
            res.render('registerOtp',{message:"OTP is not correct"})
        }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}



const loadShop = async (req,res)=>{
try {
    const userId = req.id
    const products = await Product.find()
    
    const carts = await Cart.find({userId:userId})
    console.log("carts:",carts);
    let quantity = 0
    let total = 0
    carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    
    
    console.log(quantity);
    res.render('shop',{products:products,quantity:quantity,total:total})
    
} catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
}
}

const loadSearch = async (req,res)=>{
    const searchQuery = req.body.query
    console.log(searchQuery);
    try {
        const products = await Product.find({
            name:{$regex:new RegExp(searchQuery,"i")}
        })
        console.log(products);
        res.json(products)
    } catch (error) {
        console.log(error);
    }
}

const loadSortAZ = async(req,res)=>{
    try {
        const userId = req.id
        const products = await Product.find().sort({name:1})
        const carts = await Cart.find({userId:userId})
        console.log("carts:",carts);
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    console.log("products",products);
        res.render("shop",{products:products,total:total})
    } catch (error) {
        console.log(error);
    }
}

const loadSortZA = async(req,res)=>{
    try {
        const userId = req.id
        const products = await Product.find().sort({name:-1})
        const carts = await Cart.find({userId:userId})
        console.log("carts:",carts);
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    console.log("products",products);
        res.render("shop",{products:products,total:total})
    } catch (error) {
        console.log(error);
    }
}

const highToLow = async(req,res)=>{
    try {
        const userId = req.id
        const products = await Product.find().sort({disprice:-1})
        console.log("products",products);
        const carts = await Cart.find({userId:userId})
        console.log("carts:",carts);
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    console.log("products",products);
        res.render("shop",{products:products,total:total})
    } catch (error) {
        console.log(error);
    }
}

const lowToHigh = async(req,res)=>{
    try {
        const userId = req.id
        const products = await Product.find().sort({disprice:1})
        console.log("products",products);
        const carts = await Cart.find({userId:userId})
        console.log("carts:",carts);
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    console.log("products",products);
        res.render("shop",{products:products,total:total})
    } catch (error) {
        console.log(error);
    }
}


const newArrivals = async(req,res)=>{
    try {
        const userId = req.id
        const products = await Product.find().sort({date:-1})
        console.log("products",products);
        const carts = await Cart.find({userId:userId})
        console.log("carts:",carts);
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    console.log("products",products);
        res.render("shop",{products:products,total:total})
    } catch (error) {
        console.log(error);
    }
}

const loadLogin = async (req,res)=>{
    try {
        res.render("login")
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}



const loadLogout = async (req,res)=>{
    try {
        console.log(req.cookies);
        res.clearCookie("jwt")
        
        res.redirect('/login')
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}
const verifyGoogle = async (req,res)=>{
    try {
        console.log("req.user",req.user);
        
        const userData = await User.findOne({email:req.user.email})
        console.log('existing use',userData);
        if(userData){
            const token = createToken({id:userData._id})
            res.cookie("jwt",token,{httpOnly:true,maxAge:600000000})
        res.redirect('/home')
            
        }
        else{
            const user =  new User({
                name:req.user.given_name,
                email:req.user.email,
                password:"123456789",
                mobile:"1234567890",
    
            })
            const userData = await user.save()
            console.log('userData',userData);
            const token = createToken({id:userData._id})
            res.cookie("jwt",token,{httpOnly:true,maxAge:600000000})
        res.redirect('/home')

        }
      
       
        
    } catch (error) {
        console.log(error);
    }
}
const verifyUser = async(req,res)=>{
    try {
        const email = req.body.name
        const password= req.body.pass
         console.log(email);
         console.log(password);
        const userData = await User.findOne({email:email})
        if(userData){
            console.log(userData);
            if(userData.status){
                console.log(userData.status);
                const passwordMatch = await bcrypt.compare(password,userData.password)
                if(passwordMatch){
                    
                    const token = createToken({id:userData._id})
                    res.cookie("jwt",token,{httpOnly:true,maxAge:600000000})
                   
                    res.redirect('/home')
        
                }
                else{
                    res.render("login",{message:"your password is incorrect"})
                }
            }
            else{
                res.render("login",{message:"you are blocked by admin"})
            }
           
        }
        else{
            res.render("login",{message:"email is invalid"})
        }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}



const forgotPassword = async (req,res)=>{
    try {
        res.render('forgot')
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}


const loadHome = async (req,res)=>{
    try {
        const products = await Product.find()
        console.log(products);
        res.render('home',{product:products})
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}



const registerOtp = async (req,res)=>{
    try {
        
        res.render('registerOtp')
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const productProfile = async(req,res)=>{
    try {
       const productId = req.query.id
       const products = await Product.findOne({_id:productId})
       const similarProducts = await Product.find({category:products.category})
        res.render("productProfile",{products:products,similarProducts:similarProducts})
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}



module.exports = { 
    verifyGoogle,
    loadRegister,
    insertUser,
    verifyRegister,
    loadLogin,
    verifyUser,
    forgotPassword,
    loadHome,
    loadOtp,
    registerOtp,
    loadShop,
    loadSearch,
    loadSortAZ, 
    loadSortZA,
    highToLow,
    lowToHigh,
    newArrivals,
    productProfile,
    loadLogout,
}