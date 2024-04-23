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
      
        console.log("type",typeof userId);
        const carts = await Cart.find({userId:userId}).populate('productId')
        
        console.log("carts",carts);
        let totalCart = 0
        let totalPrice = 0
        carts.forEach((cart)=>{
            totalCart = totalCart+cart.total
            totalPrice = totalPrice+cart.totalPrice
           
        })  
        discount = totalPrice - totalCart
        console.log("totalcart",totalCart); 
        console.log("totalprice",totalPrice);   
        res.render("cart",{carts:carts,totalCart:totalCart,totalPrice:totalPrice,discount:discount})
        
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}
const insertCart = async (req,res)=>{
    try {
        
        let userId = req.id
        console.log("userId",userId);
        const productId = req.body.productId  
        console.log(productId);  
        const quantity = parseInt(req.body.quantity)
        const size = parseInt(req.body.size)
        
        // const carts = await Cart.find()
        // console.log("carts",carts);

        const cart = await Cart.findOne({userId:userId,productId:productId,size:size}).populate("productId")
        console.log("cart",cart);
        if(cart){  
        console.log("hai");
       
        const disprice  = parseInt(cart.productId.disprice)
        const price = parseInt(cart.productId.price)
        
        console.log(disprice);   
        console.log("price",price); 
        cart.quantity += quantity
        cart.total = cart.quantity * disprice
        cart.totalPrice = cart.quantity * price
        console.log(cart.total);     
        console.log("totalPrice",cart.totalPrice);
        await cart.save()
    }
        else{

            console.log("hello");
            const product = await Product.findOne({_id:productId})
            const total = product.disprice
            const totalPrice = product.price
            console.log("product",product);
            console.log(userId);
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
        console.log("totalPrice",carts.totalPrice);    
        }   
           
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const updateCart = async (req,res)=>{

    try {
        console.log("hai");
        const userId = req.id
        console.log(req.id);
        const {quantity,productId,size} = req.body
        
        const updateCart = await Cart.findOne({userId:userId,productId:productId,size:size}).populate("productId")
        console.log("updateCart",updateCart);
        if(updateCart){


        const disprice = parseInt(updateCart.productId.disprice)
        const price = parseInt(updateCart.productId.price)
        const updateQuantity = parseInt(quantity)
        updateCart.quantity = updateQuantity
        updateCart.total = updateCart.quantity * disprice
        updateCart.totalPrice = updateCart.quantity * price
        console.log("quantity",updateCart.quantity);
        console.log(updateCart.total);


        const cart = await updateCart.save()
        console.log("cart",cart);


        const carts = await Cart.find({userId:userId})
        console.log("carts",carts);
        let totalCart = 0
        let totalPrice = 0
        carts.forEach((cart)=>{
            totalCart = totalCart+cart.total
            totalPrice = totalPrice+cart.totalPrice
           
        }) 
        discount = totalPrice - totalCart
        console.log("totolcart",totalCart);
        console.log("total price",totalPrice);
        res.status(200).json({total:updateCart.total,quantity:updateCart.quantity,totalCart:totalCart,totalPrice:totalPrice,discount:discount})
                    
    }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
    
}

const deleteCart = async (req,res)=>{
    const userId = req.id
    console.log(req.body);
    const productId = req.body.productId

    const size = req.body.size
    const cart = await Cart.find({userId:userId})
    console.log("cart",cart);
    if(cart){
        const cartData = await Cart.deleteOne({productId:productId,size:size})
        console.log("cartDatea",cartData);
        res.status(200).json({success:true})
    }
     
}

const checkOut = async (req,res)=>{
         try {
        

            console.log("req.id", req.id);
            const userId = req.id
            const wishlistCount = await wishlist.countDocuments({userId:userId})
            console.log("count",wishlistCount);
            console.log(typeof userId);
            req.session.couponId = null
            const address = await Address.find({userId:userId})
            const carts = await Cart.find({userId:userId}).populate("productId")
            console.log("carts",carts);
           
            let totalCart = 0 
            let totalPrice = 0 
            let productTotal = 0  
            carts.forEach((cart)=>{
                    
                totalCart = totalCart+cart.total
                totalPrice = totalPrice+cart.totalPrice
            })
            console.log("totalCart",totalCart);
            console.log("totalPrice",totalPrice);
            let coupons = await Coupon.find({
                "users.userId": { $nin: [userId] },
                isCoupon: true
              });
               console.log("coupons",coupons);          
           if(coupons){
           
            
            console.log("stock exist");
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
             console.log("couponData",couponData);
            
             
            
             res.render("checkout",{address:address,carts:carts,totalCart:totalCart,couponData:couponData,totalPrice:totalPrice,wishlistCount:wishlistCount}) 
         }
         else{
            res.render("checkout",{address:address,carts:carts,totalCart:totalCart,couponData:couponData,totalPrice:totalPrice,wishlistCount:wishlistCount})
         }

        
          
           
           
           
           

         } catch (error) {
            console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
         }
}


const applyCoupon = async (req,res)=>{
    try {
        console.log("req.body",req.body);
        const userId = req.id
        const couponId = req.body.selectedId
        req.session.couponId = couponId
        const total = req.body.total
        console.log(req.body.total);
        console.log(req.body.selectedId);
        const cart = Cart.find({userId:userId})
        const coupon = await Coupon.findOne({_id:couponId})
        console.log(coupon);
    
        
        const discountPercentage = parseInt(coupon.couponDiscount)
        console.log("discountPrecentage",discountPercentage);
        const couponPercentage = (discountPercentage/100)*total
        console.log("couponPrecetnage",couponPercentage);
        const couponDiscount = total - (discountPercentage/100)*total
        console.log("coupon",couponDiscount);
        
        
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
    console.log("hai");
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
    removeCoupon

}
