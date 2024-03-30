const User = require('../model/userModel')
const Admin = require("../model/adminModel")
const Category = require("../model/categoryModel")
const Product = require('../model/productModel')
const jwt = require("jsonwebtoken")
const Cart = require('../model/cartModel')
const Address = require("../model/addressModel")

const loadCart = async(req,res)=>{
    try {
        const  userId = req.id
        const carts = await Cart.find({userId:userId}).populate('productId')
        
        console.log("carts",carts);
        let totalCart = 0
        carts.forEach((cart)=>{
            totalCart = totalCart+cart.total
        })      
        res.render("cart",{carts:carts,totalCart:totalCart})
        
    } catch (error) {
        console.log(error);
    }
}
const insertCart = async (req,res)=>{
    try {
       
        let userId = req.id
        console.log("userId",userId);
        const productId = req.body.productId  
        console.log(productId);  
        const quantity = parseInt(req.body.quantity)
        const size = req.body.size
        const carts = await Cart.find()
        console.log("carts",carts);

        const cart = await Cart.findOne({productId:productId,size:size}).populate("productId")
        console.log("cart",cart);
        if(cart){  
        console.log("hai");
       
        const disprice  = parseInt(cart.productId.disprice)
        console.log(disprice);    
        cart.quantity += quantity
        cart.total = cart.quantity * disprice
        console.log(cart.total);     
        await cart.save()
    }
        else{
            console.log("hello");
            const product = await Product.findOne({_id:productId})
            const total = product.disprice
            console.log("product",product);
            console.log(userId);
            const carts = new Cart({
                userId:userId,
                productId:productId,
                size:size,
                isTrue:1,
                quantity:quantity,
                total:total
        })  
        await carts.save()    
        }          
    } catch (error) {
        console.log(error);
    }
}

const updateCart = async (req,res)=>{

    try {
        const userId = req.id
        const {quantity,productId,size} = req.body
        console.log(typeof quantity);
        const updateCart = await Cart.findOne({productId:productId,size:size}).populate("productId")
        if(updateCart){


        disprice = parseInt(updateCart.productId.disprice)
        const updateQuantity = parseInt(quantity)
        updateCart.quantity = updateQuantity
        updateCart.total = updateCart.quantity * disprice
        
        console.log(updateCart.total);


        await updateCart.save()


        const carts = await Cart.find({userId:userId})
        console.log("carts",carts);
        let totalCart = 0
        carts.forEach((cart)=>{
            totalCart = totalCart+cart.total
        })
        console.log(totalCart);
        res.status(200).json({total:updateCart.total,quantity:updateCart.quantity,totalCart:totalCart})
                    
    }
    } catch (error) {
        console.log(error);
    }
    
}

const deleteCart = async (req,res)=>{
    const userId = req.id
    console.log(req.body);
    const productId = req.body.productId
    const size = req.body.size
    const cart = await Cart.find({userId:userId})
    console.log(cart);
    if(cart){
        const cartData = await Cart.deleteOne({productId:productId,size:size})
        console.log(cartData);
        res.status(200).json({success:true})
    }
     
}

const checkOut = async (req,res)=>{
         try {
            console.log(req.id);
            const userId = req.id
        
            const address = await Address.find({userId:userId})
            const carts = await Cart.find({userId:userId}).populate("productId")
           
            let totalCart = 0    
            carts.forEach((cart)=>{
                totalCart = totalCart+cart.total
            })

            res.render("checkout",{address:address,carts:carts,totalCart:totalCart})

         } catch (error) {
            console.log(error);
         }
}


module.exports = {
    loadCart,
    insertCart,
    updateCart,
    deleteCart,
    checkOut
}
