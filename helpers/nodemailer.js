const nodemailer = require('nodemailer')
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
        
  async function sendMail(email,otpCode){            
        try {
            const mailOptions = {
                from : process.env.USER_NAME,
                to : email,
                subject :"Verification Code",
                text :`Your OTP code is ${otpCode}`
            };
        const info = await transporter.sendMail(mailOptions)
            return true
        } catch (error) {
            console.log(error);
            return false
        }    
    } 

    module.exports = {sendMail }  