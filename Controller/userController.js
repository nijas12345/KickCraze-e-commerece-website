const User = require('../model/userModel')
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const Product = require('../model/productModel')
const Address = require("../model/addressModel")
const Cart = require("../model/cartModel")
const wishlist = require('../model/wishlistModel')
const {sendMail} = require("../helpers/nodemailer")
const Category = require('../model/categoryModel')
const Wallet = require('../model/walletModel')


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
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
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
        let wallet
      
        const checkEmail = await User.findOne({email:req.body.email})
        if(checkEmail){
            res.status(200).render("register",{message:"Email already exists"})
        }   
        else{
            
            if(req.body.referal){
                let user = await User.findOne({referal:req.body.referal})
                
                if(user){   
                                
                  req.session.referal = 500
                 
                   wallet = await Wallet.findOne({userId:user._id})
                  
                  if(wallet){
                    
                    const walletId = wallet._id
                     wallet = await Wallet.findByIdAndUpdate(
                        walletId,
                        {
                            $push: {
                                details: {
                                    amount: 500,
                                    transactionType: "Credited",
                                    method: "refferal",
                                    date: Date.now()
                                }
                            }
                        },
                        { new: true } // To return the updated document
                    );
                  }
                  else{
                   
                    const newWallet = new Wallet({
                        userId: user._id,
                        details: [{
                            amount: 500,
                            transactionType: "Credited",
                            method: "refferal",
                            date: Date.now()
                        }]
                    });
                    await newWallet.save()
                  }
                }
                else{
                    res.status(200).render("register",{message1:"referal code is not exist"})
                }
            }
            
              
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
        
       
        console.log(process.env.USER_PASSWORD);
        const isSend = await sendMail(email,otpCode);
               
        if(isSend){           
                // console.log("Email sent:" +info.response)
                res.render("registerOtp")
        }
        else{
              console.error("Error sending mail")
                const statusCode = 500;
                const errorMessage = "Failed to send OTP mail"
                res.status(statusCode).render("errorPage",{statusCode,errorMessage})
                
        }

    
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const verifyRegister = async(req,res)=>{

    
    try {
        
     
        let OTPs = req.body.input
    
         var loadOtp = req.session.otp
         console.log(loadOtp);
        if(loadOtp === OTPs){

            function generateReferralCode(length) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let code = '';
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    code += characters.charAt(randomIndex);
                }
                return code;
            }
            
            // Example usage
            const referralCode = generateReferralCode(8);
           
            let cust = req.session.temp
            const user = new User({
               name:cust.name,
               email:cust.email,
               mobile:cust.mobile,
               password:cust.password,
               status :1,
               referal:referralCode
            })

            const userData = await user.save()
            if(userData){
                // if(req.session.refferal == null){

                // }
                // else{
                //     const newWallet = new Wallet({
                //         userId: userData._id,
                //         details: [{
                //             amount: 500,
                //             transactionType: "Credited",
                //             method: "refferal",
                //             date: Date.now()
                //         }]
                //     });
                //     await newWallet.save()
                // }
               const token = createToken({id:userData._id})
               res.cookie("jwt",token,{httpOnly:true,maxAge:60000000})
              
               res.status(200).json({redirect:"/home"})
            }   
        }
        else{
           
            res.status(200).json({message:"OTP is invalid"})
        }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}



const loadShop = async (req,res)=>{
try {
    
    
    let searchQuery = req.query.searchQuery
    let categoryName = req.query.selectedCategory
    let selectedValue = req.query.selectedValue
    let page = parseInt(req.query.page)
    
    let limit = 5
    let skip = (page - 1)*limit
    
    let userId = req.id
    
    if(searchQuery !=="" && categoryName =="" && selectedValue=="option"){

        
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0
        carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        })
        const categories = await Category.find()
        const products = await Product.find({
            name:{$regex:new RegExp(searchQuery,"i")}
        }).skip(skip).limit(limit)
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
    }
    else if(searchQuery =="" && categoryName !=="" && selectedValue=="option"){
        
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0
        carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        })
        const categories = await Category.find()
       
        const products = await Product.find({
            category:categoryName
        }).skip(skip).limit(limit)
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
    }
    else if(searchQuery =="" && categoryName =="" && selectedValue !=="option"){
        if(selectedValue == "option1"){ 
        
            const carts = await Cart.find({userId:userId})
            
            let quantity = 0
            let total = 0
            carts.forEach((cart)=>{
                quantity = quantity +cart.quantity
                total = total + cart.total
            })
            const categories = await Category.find()
            const products = await Product.find({         
            }).sort({name:1}).skip(skip).limit(limit)
            
            res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
       else if(selectedValue =="option2"){
              
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0
        carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        })
        const categories = await Category.find()
        const products = await Product.find({         
        }).sort({name:-1}).skip(skip).limit(limit)
        
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
        
    
       else if(selectedValue =="option3"){
            
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0
        carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        })
        const categories = await Category.find()
        const products = await Product.find({         
        }).sort({disprice:1}).skip(skip).limit(limit)
       
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
       else if(selectedValue =="option4"){
        const carts = await Cart.find({userId:userId})
       
        let quantity = 0
        let total = 0
        carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        })
        const categories = await Category.find()
        
        const products = await Product.find({         
        }).sort({disprice:-1}).skip(skip).limit(limit)
        
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
        else{
            const carts = await Cart.find({userId:userId})
            
            let quantity = 0
            let total = 0
            carts.forEach((cart)=>{
                quantity = quantity +cart.quantity
                total = total + cart.total
            })
            const categories = await Category.find()
            const products = await Product.find({         
            }).sort({date:-1}).skip(skip).limit(limit)
           
            res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
    
    }
    else if(searchQuery !== "" && categoryName !== "" && selectedValue == "option") 
    {
    const carts = await Cart.find({userId:userId})
  
    let quantity = 0
    let total = 0
    carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    let categories = await Category.find()
    const products = await Product.find({
        category:categoryName,name:{$regex:new RegExp(searchQuery,"i")}
    }).skip(skip).limit(limit)
   
    
    res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})    

    }
    else if(searchQuery!== "" && categoryName =="" && selectedValue !== "option" ){
        const carts = await Cart.find({userId:userId})
       
        let quantity = 0
        let total = 0
        carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        })
        const categories = await Category.find()
        if(selectedValue == "option1"){ 
            
            const products = await Product.find({ name:{$regex:new RegExp(searchQuery,"i")},       
            }).sort({name:1}).skip(skip).limit(limit)
            
            res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
       else if(selectedValue =="option2"){
            
        const products = await Product.find({ name:{$regex:new RegExp(searchQuery,"i")}       
        }).sort({name:-1}).skip(skip).limit(limit)
       
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
           
       else if(selectedValue =="option3"){
              
        const products = await Product.find({ name:{$regex:new RegExp(searchQuery,"i")},       
        }).sort({disprice:1}).skip(skip).limit(limit)
        
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
       else if(selectedValue =="option4"){
       
        
        const products = await Product.find({  name:{$regex:new RegExp(searchQuery,"i")},        
        }).sort({disprice:-1}).skip(skip).limit(limit)
       
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
        else{
           
            const products = await Product.find({name:{$regex:new RegExp(searchQuery,"i")},        
            }).sort({date:-1}).skip(skip).limit(limit)
           
            res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }  
    
    }
    else if(searchQuery == "" && categoryName !=="" && selectedValue !== "option" ){
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0
        carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        })
        const categories = await Category.find()
        if(selectedValue == "option1"){ 
          
            const products = await Product.find({ category:categoryName,       
            }).sort({name:1}).skip(skip).limit(limit)
            
            res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
       else if(selectedValue =="option2"){
           
        const products = await Product.find({ category:categoryName      
        }).sort({name:-1}).skip(skip).limit(limit)
        
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
           
       else if(selectedValue =="option3"){
              
        const products = await Product.find({ category:categoryName       
        }).sort({disprice:1}).skip(skip).limit(limit)
       
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
       else if(selectedValue =="option4"){
       
        
        const products = await Product.find({  category:categoryName        
        }).sort({disprice:-1}).skip(skip).limit(limit)
      
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
        else{
           
            const products = await Product.find({category:categoryName       
            }).sort({date:-1}).skip(skip).limit(limit)
           
            res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }  
    
    }

    else if(searchQuery !==undefined &&  searchQuery !== "" && categoryName !=="" && selectedValue !== "option" ){
        
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0
        carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        })
        const categories = await Category.find()
        if(selectedValue == "option1"){ 
            
            const products = await Product.find({ category:categoryName,name:{$regex:new RegExp(searchQuery,"i")}       
            }).sort({name:1}).skip(skip).limit(limit)
           
            res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
       else if(selectedValue =="option2"){
            
        const products = await Product.find({ category:categoryName,name:{$regex:new RegExp(searchQuery,"i")}     
        }).sort({name:-1}).skip(skip).limit(limit)
        
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
           
       else if(selectedValue =="option3"){
              
        const products = await Product.find({ category:categoryName ,name:{$regex:new RegExp(searchQuery,"i")}      
        }).sort({disprice:1}).skip(skip).limit(limit)
       
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
       else if(selectedValue =="option4"){
       
        
        const products = await Product.find({  category:categoryName ,name:{$regex:new RegExp(searchQuery,"i")}      
        }).sort({disprice:-1}).skip(skip).limit(limit)
        
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        }
        else{
           
            const products = await Product.find({category:categoryName ,name:{$regex:new RegExp(searchQuery,"i")}      
            }).sort({date:-1}).skip(skip).limit(limit)
           
            res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})
        } 
    }

    
    else{
     
           const carts = await Cart.find({userId:userId})
       
        let quantity = 0
        let total = 0
        carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        })
        const categories = await Category.find()
        const products = await Product.find().skip(skip).limit(limit)
      
        res.render('shop',{products:products,quantity:quantity,total:total,categories:categories,searchQuery:searchQuery,categoryName:categoryName,selectedValue:selectedValue})       
        
    }


    
} catch (error) {
    
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
}
}

const loadSearch = async (req,res)=>{
    const searchQuery = req.body.query
    const categoryId = req.body.category
    const option = req.body.selectedValue
  
    
    try {
        if(option ==="option" || option == undefined){
            
        const category = await Category.findOne({_id:categoryId})
        
        const name = category.name
        

    
        const products = await Product.find({category:name,
            name:{$regex:new RegExp(searchQuery,"i")}
        })
     
        res.json(products)
        }
       else if(option == "option1"){
        
       
        const category = await Category.findOne({_id:categoryId})
        
        const name = category.name
       

    
        const products = await Product.find({category:name,
            name:{$regex:new RegExp(searchQuery,"i")}
        }).sort({name:1})
      
        res.json(products)
    }
   else if(option =="option2"){
        
        const category = await Category.findOne({_id:categoryId})
    
        const name = category.name
        

    
        const products = await Product.find({category:name,
            name:{$regex:new RegExp(searchQuery,"i")}
        }).sort({name:-1})
        
        res.json(products)
    }
    

   else if(option =="option3"){
        
        const category = await Category.findOne({_id:categoryId})
       
        const name = category.name
       

    
        const products = await Product.find({category:name,
            name:{$regex:new RegExp(searchQuery,"i")}
        }).sort({disprice:1})
      
        res.json(products)
    }
   else if(option=="option4"){
    
        const category = await Category.findOne({_id:categoryId})
        
        const name = category.name
        
    
    
        const products = await Product.find({category:name,
            name:{$regex:new RegExp(searchQuery,"i")}
        }).sort({disprice:-1})
        
        res.json(products)
    }
   else if(option =="option5"){
        
        const category = await Category.findOne({_id:categoryId})
        
        const name = category.name
        
    
    
        const products = await Product.find({category:name,
            name:{$regex:new RegExp(searchQuery,"i")}
        }).sort({date:-1})
        
        res.json(products)
    }
    
} catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
}
}

const SearchInput = async (req,res)=>{
    
        
        const searchQuery = req.body.query
        
        const option = req.body.selectedValue
        

        
        
        try {
            if(option ==="option" || option == undefined){  
        
            const products = await Product.find({
                name:{$regex:new RegExp(searchQuery,"i")}
            })
            
            res.json(products)
            }
           else if(option == "option1"){ 
        
            const products = await Product.find({
                name:{$regex:new RegExp(searchQuery,"i")}
            }).sort({name:1})
            
            res.json(products)
        }
       else if(option =="option2"){
              
            const products = await Product.find({
                name:{$regex:new RegExp(searchQuery,"i")}
            }).sort({name:-1})
            
            res.json(products)
        }
        
    
       else if(option =="option3"){
            
           
        
            const products = await Product.find({
                name:{$regex:new RegExp(searchQuery,"i")}
            }).sort({disprice:1})
            
            res.json(products)
        }
       else if(option=="option4"){
        
                  
        
            const products = await Product.find({
                name:{$regex:new RegExp(searchQuery,"i")}
            }).sort({disprice:-1})
            
            res.json(products)
        }
       else if(option =="option5"){
            
       
        
        
            const products = await Product.find({
                name:{$regex:new RegExp(searchQuery,"i")}
            }).sort({date:-1})
            
            res.json(products)
        }
    }
  catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const loadSortAZ = async(req,res)=>{
    try {

        if(req.query.id !== undefined){
           
           const categoryId = req.query.id
           const userId = req.id
            
           const category = await Category.findOne({_id:req.query.id})
           const name = category.name
           const products = await Product.find({category:name}).sort({name:1})
           
          
           const carts = await Cart.find({userId:userId})
           
           let quantity = 0
           let total = 0
   
           carts.forEach((cart)=>{
           quantity = quantity +cart.quantity
           total = total + cart.total
       
       })
       res.render("shopCategory",{products:products,total:total,category:categoryId})

        }else{

       
        const userId = req.id
        const products = await Product.find().sort({name:1})
        // const categories = await 
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    
    })
   
        res.render("shop",{products:products,total:total})
        
}
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const loadSortZA = async(req,res)=>{
    try {

        if(req.query.id !== undefined){
            
            const categoryId = req.query.id
            const userId = req.id
             
            const category = await Category.findOne({_id:req.query.id})
            const name = category.name
            const products = await Product.find({category:name}).sort({name:-1})
            
           
            const carts = await Cart.find({userId:userId})
            
            let quantity = 0
            let total = 0
    
            carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        
        })
        res.render("shopCategory",{products:products,total:total,category:categoryId})
 
         }else{
        const userId = req.id
        const products = await Product.find().sort({name:-1})
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
   
        res.render("shop",{products:products,total:total})

    }
}
     catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const highToLow = async(req,res)=>{
    try {
        console.log("req.query",req.query.id);
        if(req.query.id !== undefined){
            
            const categoryId = req.query.id
            const userId = req.id
             
            const category = await Category.findOne({_id:req.query.id})
            
            const name = category.name
            
            const products = await Product.find({category:name}).sort({disprice:-1})
            
           
            const carts = await Cart.find({userId:userId})
            
            let quantity = 0
            let total = 0
    
            carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        
        })
        res.render("shopCategory",{products:products,total:total,category:categoryId})
 
         }else{
           
        const userId = req.id
        const products = await Product.find().sort({disprice:-1})
        
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    
        res.render("shop",{products:products,total:total})
    }
 } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const lowToHigh = async(req,res)=>{
    try {

        if(req.query.id !== undefined){
            
            const categoryId = req.query.id
            const userId = req.id
             
            const category = await Category.findOne({_id:req.query.id})
            const name = category.name
            const products = await Product.find({category:name}).sort({disprice:1})
            
            
            const carts = await Cart.find({userId:userId})
            
            let quantity = 0
            let total = 0
    
            carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        
        })
        res.render("shopCategory",{products:products,total:total,category:categoryId})
 
         }else{
        const userId = req.id
        const products = await Product.find().sort({disprice:1})
        
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    
        res.render("shop",{products:products,total:total})
    }
 } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}


const newArrivals = async(req,res)=>{
    try {

        if(req.query.id !== undefined){
            
            const categoryId = req.query.id
            const userId = req.id
             
            const category = await Category.findOne({_id:req.query.id})
            const name = category.name
            const products = await Product.find({category:name}).sort({data:-1})
            
            
            const carts = await Cart.find({userId:userId})
            
            let quantity = 0
            let total = 0
    
            carts.forEach((cart)=>{
            quantity = quantity +cart.quantity
            total = total + cart.total
        
        })
        res.render("shopCategory",{products:products,total:total,category:categoryId})
 
         }else{
        const userId = req.id
        const products = await Product.find().sort({date:-1})
        
        const carts = await Cart.find({userId:userId})
        
        let quantity = 0
        let total = 0

        carts.forEach((cart)=>{
        quantity = quantity +cart.quantity
        total = total + cart.total
    })
    
        res.render("shop",{products:products,total:total})
    }
 } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
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
        
        
        const userData = await User.findOne({email:req.user.email})
        
        if(userData){
            const token = createToken({id:userData._id})
            res.cookie("jwt",token,{httpOnly:true,maxAge:6000000000})
        res.redirect('/home')
            
        }
        else{
            function generateReferralCode(length) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let code = '';
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    code += characters.charAt(randomIndex);
                }
                return code;
            }
            
            // Example usage
            const referralCode = generateReferralCode(8);
            const user =  new User({
                name:req.user.given_name,
                email:req.user.email,
                password:"123456789",
                mobile:"1234567890",
                referralCode:referralCode

    
            })
            const userData = await user.save()
            
            const token = createToken({id:userData._id})
            res.cookie("jwt",token,{httpOnly:true,maxAge:600000000})
            res.redirect('/home')

        }
      
       
        
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}
const verifyUser = async(req,res)=>{
    try {
        const email = req.body.name
        const password= req.body.pass
         
        const userData = await User.findOne({email:email})
        if(userData){
            
            if(userData.status){
                
                const passwordMatch = await bcrypt.compare(password,userData.password)
                if(passwordMatch){
                    
                    const token = createToken({id:userData._id})
                    res.cookie("jwt",token,{httpOnly:true,maxAge:600000000})
                   
                    res.redirect('/home')
        
                }
                else{
                    res.render("login",{message1:"your password is incorrect"})
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


const  loadHome = async (req,res)=>{
    try {
        const userId = req.id
        
        const products = await Product.find()
        
        const wishlistCount = await wishlist.countDocuments({userId:userId})
        
        
        const categories = await Category.find({delete: true})
        console.log("categories",categories); 
        
        res.render('home',{product:products,wishlistCount:wishlistCount,categories:categories,userId:userId})
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

const   productProfile = async(req,res)=>{
    try {
       const userId = req.id
       
       const productId = req.query.id
       const products = await Product.findOne({_id:productId})
       const category = await Category.findOne({name:products.category})
       const categories = await Category.find({delete: true})
       const similarProducts = await Product.find({category:products.category})
        res.render("productProfile",{products:products,similarProducts:similarProducts,category:category,userId:userId,categories:categories})
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}

const insertWishlist = async (req,res)=>{
    try {
   
        const userId = req.id
        const productId = req.body.productId
       
        const wishlistData = await wishlist.findOne({userId:userId,productId:productId})
        console.log(wishlistData);
        if(wishlistData){
            res.status(200).json({success:true})
        }
        else{
           
            const wishlistData = new wishlist ({
               userId : userId,
               productId :productId
            })
            await wishlistData.save()

        }
        res.status(200).json({success:true})
        
        
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}

const showWishlist = async (req,res)=>{
    try {
        const userId = req.id
        const categories = await Category.find({delete: true})
        const wishlistData = await wishlist.find({userId:userId}).populate("userId").populate("productId")
       
        res.render("wishlist",{wishlistData:wishlistData,categories:categories})

    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}

const removeWishlist = async (req,res)=>{
    try {
        const userId = req.id
        const productId = req.query.id
        const wishlists = await wishlist.findOneAndDelete({productId:productId})
        
        const wishlistData = await wishlist.find({userId:userId}).populate("userId").populate("productId")
        res.redirect('/show-wishlist')
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage}) 
    }
}


//categories 


const sportShoe = async (req,res)=>{
    try {
        const userId = req.id
      const categoryId = req.query.id
       const category = await Category.findOne({_id:req.query.id})
       const name = category.name
       const products = await Product.find({category:name})
       const categories = await Category.find({delete: true})
       
       const carts = await Cart.find({userId:userId})
       
       let quantity = 0
       let total = 0
       carts.forEach((cart)=>{
           quantity = quantity +cart.quantity
           total = total + cart.total
       })
       res.render('shopCategory',{products:products,total:total,quantity:quantity,category:categoryId,categories:categories})

        
        
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
    SearchInput,
    loadSortAZ, 
    loadSortZA,
    highToLow,
    lowToHigh,
    newArrivals,
    productProfile,
    loadLogout,
    insertWishlist,
    showWishlist,
    removeWishlist,
    sportShoe,

}