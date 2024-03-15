const User = require('../model/userModel')
const Admin = require("../model/adminModel")
const Category = require("../model/categoryModel")
const Product = require('../model/productModel')
const sharp = require("sharp")
const path=require('path')


//Admin Authentication

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
                res.redirect('dashboard')
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


const userUnblock = async (req,res)=>{
    try {
    const userId = req.query.id;
    const user = await User.findOneAndUpdate({_id:userId},{status:true})
    const users = await User.find({})
    console.log(user);
    
    res.render("userlist",{users:users})
    } catch (error) {
        console.log(error);
        const errorMessage = "internal Servor Error"
        return res.status(500).render("errorPage",{statusCode:500,errorMessage})
    }
    
}


const userBlock = async (req,res)=>{

    try {
    const userId = req.query.id;
    console.log(userId);
    const user = await User.findOneAndUpdate({_id:userId},{status:false})
    console.log(user);
    const users = await User.find({})
    res.render("userlist",{users:users})
    }
     catch (error) {
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
        console.log(req.body.description);
        const category = new Category({
            name:req.body.name,
            description:req.body.description
        }) 
        const categoryData = await category.save()
        if(categoryData){
            const categories =await Category.find()
            res.render('categories',{categories:categories})
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
        console.log(req.body.sizes);
      
       const fileNames = req.files.map(file=>file.filename)
      
        
      let image = []
         
      for(let file of req.files){
        const randomInteger = Math.floor(Math.random() * 20000001)
    
        const outputPath1=path.join(__dirname,"../public/croppedImages","crop"+file.filename)
        const outputPath2 = "/croppedImages/"+"crop"+file.filename
        console.log("imgPath",outputPath1);
        const croppedImage = await sharp(file.path)
        .resize(1000,1000,{
            fit:"fill",
        })  
        .toFile(outputPath1)
         image.push(outputPath2)
      }
   
    
     
      const price ="₹" +req.body.price
      const disprice = "₹" +req.body.disprice
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
        const price = "₹ "+req.body.price
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




module.exports = {
    adminLogin,
    adminForgot,
    adminDashboard,
    ListProduct,
    productCategories,
    addProduct,
    userUnblock,
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
}