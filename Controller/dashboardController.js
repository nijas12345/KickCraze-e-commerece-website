const User = require('../model/userModel')
const jwt = require("jsonwebtoken")
const Product = require('../model/productModel')
const Address = require("../model/addressModel")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const Order = require("../model/orderModel")
const wishlist = require('../model/wishlistModel')
const Wallet = require('../model/walletModel')



const securePassword = async (password)=>{
    try {
      const passwordHash = await bcrypt.hash(password,10)
      return passwordHash
    } catch (error) {
        console.log(error);
    }
}



const userProfile = async(req,res)=>{
    try {
        
       const userId = req.id
       console.log("user",userId);
       const address = await Address.find({userId:userId})
       const user = await User.find({_id:userId})
       const orders = await Order.find({userId:userId}).populate("products.productId").sort({createdAt: -1})
    //    console.log(orders);
    //    console.log(userId);
    //    console.log("user",user);
        
       const wishlistData = await wishlist.find({userId:userId}).populate("userId").populate("productId")
       console.log("wishlistdata",wishlistData);
       
       const wallets = await Wallet.findOne({userId:userId})

       console.log("wallets",wallets);
       let creditedAmount = 0
       let debitedAmount = 0
       if(wallets){
        wallets.details.forEach((wallet)=>{
            if(wallet.transactionType == "Credited"){
             creditedAmount += wallet.amount 
            }
            else{
              debitedAmount += wallet.amount
            }
  
         })
       }
      
      console.log("credited",creditedAmount);
      console.log("debited",debitedAmount);
       totalAmount = creditedAmount - debitedAmount
       console.log("totalAmount",totalAmount);
      
       res.render("userProfile",{addressData:address,user:user,orders:orders,wishlistData:wishlistData,totalAmount:totalAmount,wallets:wallets})
        
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }   
}
const addAddress = async(req,res)=>{
    try {
        
       const address = new Address({
           userId:req.id,
           name:req.body.name,
           state:req.body.state,
           houseName:req.body.houseName,
           pin:req.body.zip,
           mobile:req.body.mobile
       })
      
        await address.save()
       res.status(200).json({success:true,message:'Address saved'})

    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

const addEdit = async(req,res)=>{
    try {
        
        const id = req.body.id
        const addressId = new mongoose.Types.ObjectId(id)

        
        const address = await Address.findOneAndUpdate({_id:addressId},{
        name:req.body.name,
        state:req.body.state,
        pin:req.body.zip,
        houseName:req.body.houseName,
        mobile:req.body.mobile
    })
    const addressData = await address.save()
    if(addressData){
        res.status(200).json({success:true})
    }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

deleteAddres = async(req,res)=>{
    try {
        const addressId = req.query.id
        console.log(addressId);
        const address =await Address.findByIdAndDelete(addressId)     
            res.redirect('/userProfile')
  
      
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}
     
const editUserProfile = async (req,res)=>{
    try {
        const id = req.id
      const {name,email,mobile,password} = req.body
      const spassword = await securePassword(password)
      const user = await User.findByIdAndUpdate(id,{name:name,email:email,mobile:mobile,password:spassword})
     console.log(user);
     userData = user.save()
     if(userData){
        res.status(200).json({success:true})
     }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}


module.exports = {
    userProfile,
    addAddress,
    addEdit,
    deleteAddres,
    editUserProfile
}