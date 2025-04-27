const User = require('../model/userModel')
const Admin = require("../model/adminModel")
const Category = require("../model/categoryModel")
const Product = require('../model/productModel')
const jwt = require("jsonwebtoken")
const Cart = require('../model/cartModel')
const Address = require("../model/addressModel")
const Coupon = require('../model/couponModel')
const wishlist = require('../model/wishlistModel')


const loadCart = async(req,res)=>{
    try {
        const  userId = req.id
        
        const carts = await Cart.find({userId:userId}).populate('productId')
        console.log("asdfasd",carts);
        const categories = await Category.find({delete: true})
        
        let totalCart = 0
        let totalPrice = 0
        carts.forEach((cart)=>{
            totalCart = totalCart+cart.total
            totalPrice = totalPrice+cart.totalPrice
           
        })  
        discount = totalPrice - totalCart
          
        res.render("cart",{carts:carts,totalCart:totalCart,totalPrice:totalPrice,discount:discount,categories:categories})
        
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}
const insertCart = async (req,res)=>{
    try {
        
        let userId = req.id
        console.log("req.body11",req.body);
      
        const productId = req.body.productId  
         
        const quantity = parseInt(req.body.quantity)
        const size = parseInt(req.body.size)
        const cart = await Cart.findOne({userId:userId,productId:productId,size:size}).populate("productId")
        console.log("cart",cart);
        if(cart){  
      
        if(cart.quantity>=6){
            
        }else{
        const disprice  = parseInt(cart.productId.disprice)
        const price = parseInt(cart.productId.price)
        
          
         
        cart.quantity += quantity
        cart.total = cart.quantity * disprice
        cart.totalPrice = cart.quantity * price
        
        await cart.save()
        }
    }
        else{

           
            
            const product = await Product.findOne({_id:productId})
            const total = quantity*product.disprice
            const totalPrice = quantity*product.price
           
            
            const carts = new Cart({
                userId:userId,
                productId:productId,
                size:size,
                isTrue:1,
                quantity:quantity,
                total:total,
                totalPrice:totalPrice
        })  
        await carts.save()  
        
        }   
           
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const updateCart = async (req,res)=>{

    try {
       
        const userId = req.id
        
        const {quantity,productId,size} = req.body
        console.log("req.body22",req.body);
        if(req.body.quantity == ""){
        console.log("hai");
        }else{
        const updateCart = await Cart.findOne({userId:userId,productId:productId,size:size}).populate("productId")
      
        if(updateCart){


        const disprice = parseInt(updateCart.productId.disprice)
        const price = parseInt(updateCart.productId.price)
        const updateQuantity = parseInt(quantity)
        updateCart.quantity = updateQuantity
        updateCart.total = updateCart.quantity * disprice
        updateCart.totalPrice = updateCart.quantity * price
        const cart = await updateCart.save()
        


        const carts = await Cart.find({userId:userId})
        
        let totalCart = 0
        let totalPrice = 0
        carts.forEach((cart)=>{
            totalCart = totalCart+cart.total
            totalPrice = totalPrice+cart.totalPrice
           
        }) 
        discount = totalPrice - totalCart
       
        res.status(200).json({total:updateCart.total,quantity:updateCart.quantity,totalCart:totalCart,totalPrice:totalPrice,discount:discount})
    }            
    }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
    
}

const deleteCart = async (req,res)=>{
    const userId = req.id
    
    const productId = req.body.productId

    const size = req.body.size
    const cart = await Cart.find({userId:userId})

    if(cart){
        const cartData = await Cart.deleteOne({productId:productId,size:size})
        
        res.status(200).json({success:true})
    }
     
}

const clearCart = async (req,res)=>{
    try {
        const userId = req.id
        const cartData = await Cart.deleteMany({userId:userId})
        res.redirect('/home')
    } catch (error) {
        console.log(error);
    }
}

const checkOut = async (req,res)=>{
         try {
        

            const categories = await Category.find({delete: true})
            const userId = req.id
            const wishlistCount = await wishlist.countDocuments({userId:userId})
            
            
            req.session.couponId = null
            const address = await Address.find({userId:userId})
            const carts = await Cart.find({userId:userId}).populate("productId")
           
           
            let totalCart = 0 
            let totalPrice = 0 
            let productTotal = 0  
            carts.forEach((cart)=>{
                    
                totalCart = totalCart+cart.total
                totalPrice = totalPrice+cart.totalPrice
            })
            if(totalCart == 0){
                res.redirect('/home')
            }
            
            let coupons = await Coupon.find({
                "users.userId": { $nin: [userId] },
                isCoupon: true
              });
           console.log("coupons",coupons);            
           if(coupons){
           
            
            
            let couponData  = []
             coupons.forEach((coupon)=>{
               
             if(totalCart < parseInt(coupon.maximumAmount) && totalCart >= parseInt(coupon.minimumAmount) && coupon.isCoupon === true){
                       couponData.push({
                         couponId : coupon._id,
                         couponCode : coupon.couponCode,
                         couponDiscount : coupon.couponDiscount
                       })
               }
                          
             })
            
            
             
            
             res.render("checkout",{address:address,carts:carts,totalCart:totalCart,couponData:couponData,totalPrice:totalPrice,wishlistCount:wishlistCount,categories:categories}) 
         }
         else{
            res.render("checkout",{address:address,carts:carts,totalCart:totalCart,couponData:couponData,totalPrice:totalPrice,wishlistCount:wishlistCount,categories:categories})
         }

        
          
           
           
           
           

         } catch (error) {
            console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
         }
}


const applyCoupon = async (req,res)=>{
    try {
        
        const userId = req.id
        const couponId = req.body.selectedId
        req.session.couponId = couponId
        const total = req.body.total
       
        const cart = Cart.find({userId:userId})
        const coupon = await Coupon.findOne({_id:couponId})
       
    
        
        const discountPercentage = parseInt(coupon.couponDiscount)
        
        const couponPercentage = (discountPercentage/100)*total
        
        const couponDiscount = total - (discountPercentage/100)*total
        
        
        
            const couponData = await Coupon.findByIdAndUpdate(couponId,
              { $addToSet: { users: { userId: userId } } }
            )
        
        // console.log(couponData);
        // const coup = await Coupon.find()
        // console.log("coup",coup);
        res.status(200).json({total:total,couponPercentage:couponPercentage,couponDiscount:couponDiscount})
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
} 

const removeCoupon = async(req,res)=>{

    try {
     const userId = req.id
    const couponId = req.body.selectedId
    req.session.couponId = null
    const coupon = await Coupon.findOne({_id:couponId})

    if (coupon) {
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { $pull: {users:{userId:userId}} }, { multi:true,new: true });
    }
    res.status(200).json({redirect:'/checkout'})
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
    
    
}

module.exports = {
    loadCart,
    insertCart,
    updateCart,
    deleteCart,
    checkOut,
    applyCoupon,
    removeCoupon,
    clearCart

}
