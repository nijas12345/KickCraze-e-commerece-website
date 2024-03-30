const User = require('../model/userModel')
const Admin = require("../model/adminModel")
const Category = require("../model/categoryModel")
const Product = require('../model/productModel')
const Order = require("../model/orderModel")
const sharp = require("sharp")
const path=require('path')
const jwt = require("jsonwebtoken")


const createToken = (admin)=>{
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET
    return jwt.sign(admin,ADMIN_JWT_SECRET,{expiresIn:"1h"})
}

//Admin Authentication


const adminRegister = async (req,res)=>{
    try {
        res.render("signUp")
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}
const verifyRegister = async (req,res)=>{
    try {
        const admin = new Admin({
            email:req.body.email,
            mobile:req.body.mobile,
            password:req.body.password

        })
    
        const adminData = await admin.save()
        
        if(adminData){
            const token = createToken({id:adminData._id})
            res.cookie("Adminjwt",token,{httpOnly:true,maxAge:6000000})
            res.redirect('/admin/dashboard')      
        }
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}
const adminLogin = async (req,res)=>{
    try {
        res.render('adminLogin')
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}


const adminVerify = async (req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        
        const adminData = await Admin.findOne({email:email})
        if(adminData){
            if(adminData.password===password){
            const token = createToken({id:adminData._id})
            res.cookie("Adminjwt",token,{httpOnly:true,maxAge:60000000})
                res.redirect('/admin/dashboard')
                console.log(token);
            }
            else{
                res.render("adminLogin",{message:"Password is incorrect"})
            }         
        }
        else{
            res.render("adminLogin",{message:"Email is incorrect"})
        }
    }   
     catch (error) {
     console.log(error);
     const errorMessage = "internal Servor Error"
     return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}


const adminForgot = async (req,res)=>{
    try {
        res.render("forgot")
    }
     catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}

//logout

const loadLogout = async (req,res)=>{
    try {
       
        res.clearCookie("Adminjwt")
        res.redirect('/admin/login')
    } catch (error) {
        console.log(error);
     const errorMessage = "internal Servor Error"
     return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}

//dashboard


const adminDashboard = async (req,res)=>{
    try {
      res.render('dashboard')
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}



//user Management

const userList = async (req,res)=>{
    try {
        const users =await User.find({})   
        res.render('userlist',{users:users})
    } 
    catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}


const  userBlock= async (req,res)=>{
    try {
    const userId = req.query.id
    console.log(userId);
    const user = await User.find({_id:userId})
    console.log(user);
    userStatus = user[0].status
    if(userStatus == true){
        console.log("hai");
        await User.findOneAndUpdate({_id:userId},{status:false})   
        const users = await User.find({})        
        res.render("userlist",{users:users})
    }
    else{  
        console.log("hai2"); 
        await User.findOneAndUpdate({_id:userId},{status:true})
        const users = await User.find({})
        res.render("userlist",{users:users})  
    }
    
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
    
}

//category

const productCategories = async (req,res)=>{
    try {
        const categories =await Category.find()
        console.log(categories);
        res.render('categories',{categories:categories})
    }
     catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}


const insertCategories = async (req,res)=>{
    try {
      
      
       
        const categories = await Category.findOne({name:req.body.name})
        
        if(categories){
           const categories =await Category.find()
            res.render('categories',{message:"This category is already exist",categories:categories})
        }
        else{
            const category = new Category({
                name:req.body.name,
                description:req.body.description
            }) 
            const categories =await Category.find()
            res.render('categories',{categories:categories})
            const categoryData = await category.save()
           
        }
    }
     catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}


const editCategories = async (req,res)=>{
   try {
     req.session.temp = req.query.id
     console.log(req.query.id);    
     res.render('editCategory') 
   }
    catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
   } 
}


const updateCategories = async (req,res)=>{
    try {
        const data = req.session.temp
        const name = req.body.name 
        const description = req.body.description
        const updateData = await Category.findByIdAndUpdate(data,{name:name,description:description})
        
         if(updateData){
                   const categories = await Category.find()
                   res.render("categories",{categories:categories})
         }        
    }
     catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}


const deleteCategories = async (req,res)=>{
    try {
         
         const categoryId = req.query.id
         const editCategory = await Category.findByIdAndUpdate(categoryId,{delete:false})
         const categories = await Category.find()
         res.render("categories",{categories:categories})
    }

     catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}   

//Product session

const ListProduct = async (req,res)=>{
    try {
        const products = await Product.find()
       
        const categories = await Category.find()
        res.render('productList',{product:products,categories:categories})
    } 
    catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}


const addProduct = async (req,res)=>{
    try {
        const categories = await Category.find()
        res.render("productAdd",{categories:categories})
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}

const insertProduct = async (req,res)=>{

    try { 
        console.log(req.files);
        console.log(req.body);
      
       const fileNames = req.files.map(file=>file.filename)
      
        console.log(fileNames);
      let image = [];

      fileNames.forEach(filename => {
        const outputPath2 = "/productImages/"+filename;
        console.log("==================",outputPath2);
        image.push(outputPath2);
      });

      console.log("imsges",image);
         
    //   for(let file of req.files){
    //     const randomInteger = Math.floor(Math.random() * 20000001)
        
    //     const outputPath1=path.join(__dirname,"../public/croppedImages","crop"+file.filename)
    //     const outputPath2 = "/croppedImages/"+"crop"+file.filename
    //     console.log("imgPath",outputPath1);
    //     const croppedImage = await sharp(file.path)
    //     .resize(1000,1000,{
    //         fit:"fill",
    //     })  
    //     .toFile(outputPath1)
    //      image.push(outputPath2)
    //   }
       
    
     
      const price =req.body.price
      const disprice = req.body.disprice
      const product = new Product({
        name:req.body.name,
        price:price,
        disprice:disprice,
        color:req.body.color,
        stock:req.body.stock,
        category:req.body.category,
        sizes:req.body.sizes,
        image:image 
      })
       const productData = await product.save()     
       const products = await Product.find()    
       const categories = await Category.find()
       res.render("productList",{product:products})

    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}


const editProduct = async (req,res)=>{
    try {
      const editId = req.query.id
      console.log(editId);
      const categories = await Category.find()
      const products = await Product.findOne({_id:editId})
      console.log(products);
      res.render("editProduct",{categories:categories,products:products})
      
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}


const insertEditedProduct = async (req,res)=>{

    try {
        const id = req.query.id
        const price = req.body.price
        const productData = await Product.findByIdAndUpdate(id,
         {
        name:req.body.name,
        price:price,
        disprice:req.body.disprice,
        color:req.body.color,
        stock:req.body.stock,
        category:req.body.category,
        sizes:req.body.sizes,
          })
          
          const products = await Product.find()
     
          const categories = await Category.find()
          res.render("productList",{product:products,categories:categories})
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
        
}


const   deleteProduct = async (req,res)=>{
    try {
        const deleteId = req.query.id
        console.log(deleteId);
        await Product.findByIdAndUpdate(deleteId,{status:false})
        const products = await Product.find()
       
        const categories = await Category.find()
        res.render("productList",{product:products,categories:categories})
        
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
}

const listOrders = async(req,res)=>{
     
    try {
        const orders = await Order.find().populate("userId").populate("addressId").populate("products.productId")
        console.log(orders);
        res.render("orders",{orders:orders})
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }

}

const cancelOrders = async(req,res)=>{
    const orderId = req.query.id
     console.log(orderId);
    try {
        const order = await Order.findByIdAndUpdate(orderId,{status:"cancelled"})
        console.log(order);
        await order.save()
        console.log(order);
      
        res.redirect("/admin/order-list")
    } catch (error) {
        console.log(error);
    }
}

const statusOrders = async(req,res)=>{
    const orderId = req.body.orderId
    const option = req.body.selectedOption
    console.log("selectedOption",option);

    const orders= await Order.findByIdAndUpdate(orderId,{status:option})
    await orders.save()
    console.log("orders",orders);
    const orderData = await Order.find({_id:orderId})
    console.log("orderData",orderData);
    res.status(200).json({redirect:'/admin/order-list'})

}


module.exports = {
    adminRegister,
    verifyRegister,
    adminLogin,
    adminForgot,
    loadLogout,
    adminDashboard,
    ListProduct,
    productCategories,
    addProduct,
    adminVerify,
    userList,
    userBlock,
    insertCategories,
    editCategories,
    deleteCategories,
    editCategories,
    updateCategories,
    insertProduct,
    editProduct,
    insertEditedProduct,
    deleteProduct,
    listOrders,
    cancelOrders,
    statusOrders
}