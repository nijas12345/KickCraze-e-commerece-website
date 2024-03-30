const jwt = require("jsonwebtoken")
const Admin = require("../model/adminModel");
require("dotenv").config
const secret = process.env.ADMIN_JWT_SECRET

const adminAuth = async (req,res,next)=>{
    
    try {
        const token = req.cookies.Adminjwt
        console.log(token)
        if(token){
            jwt.verify(token,secret,(err,decodedToken)=>{
                if(err){
                    console.log(err);
                    res.redirect("/admin/login")
                }
                else{
                    next()
                }
            })
        }
        else{
            res.redirect("/admin/login")
        }
    } catch (error) {
        console.log(error);
    }
}
const adminAuth1 = async (req,res,next)=>{
    const token = req.cookies.Adminjwt
    if(token){
        jwt.verify(token,secret,async(err,decodedToken)=>{
            if(err){
                next()
            }
            else{
                res.redirect('/admin/dashboard')
            }
        })
    }
    else{
        next()
    }
}


module.exports = {adminAuth,adminAuth1}