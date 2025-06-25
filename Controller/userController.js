const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../helpers/nodemailer");
const Wallet = require("../model/walletModel");
const StatusCode = require("../helpers/statusCode");
const renderError = require("../helpers/errorHandling");

const createToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  return jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    return renderError(res, error);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.status(StatusCode.SUCCESS).render("register");
  } catch (error) {
    return renderError(res, error);
  }
};

const insertUser = async (req, res) => {
  try {
    let wallet;

    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      res
        .status(StatusCode.SUCCESS)
        .render("register", { message: "Email already exists" });
    } else {
      if (req.body.referal) {
        let user = await User.findOne({ referal: req.body.referal });

        if (user) {
          req.session.referal = 500;

          wallet = await Wallet.findOne({ userId: user._id });

          if (wallet) {
            const walletId = wallet._id;
            wallet = await Wallet.findByIdAndUpdate(
              walletId,
              {
                $push: {
                  details: {
                    amount: 500,
                    transactionType: "Credited",
                    method: "refferal",
                    date: Date.now(),
                  },
                },
              },
              { new: true } // To return the updated document
            );
          } else {
            const newWallet = new Wallet({
              userId: user._id,
              details: [
                {
                  amount: 500,
                  transactionType: "Credited",
                  method: "refferal",
                  date: Date.now(),
                },
              ],
            });
            await newWallet.save();
          }
        } else {
          res
            .status(StatusCode.SUCCESS)
            .render("register", { message1: "referal code is not exist" });
        }
      }

      const spassword = await securePassword(req.body.pass);
      const users = {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mno,
        password: spassword,
      };
      req.session.temp = users;

      res.redirect("/loadOtp");
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const loadOtp = async (req, res) => {
  try {
    const email = req.session.temp.email;
    let otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    req.session.otp = otpCode;
    console.log(otpCode);

    const isSend = await sendMail(email, otpCode);

    if (isSend) {
      res.status(StatusCode.SUCCESS).render("registerOtp");
    } else {
      console.error("Error sending mail");
      const statusCode = StatusCode.INTERNAL_ERROR;
      const errorMessage = "Failed to send OTP mail";
      res
        .status(StatusCode.INTERNAL_ERROR)
        .render("errorPage", { statusCode, errorMessage });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const verifyRegister = async (req, res) => {
  try {
    let OTPs = req.body.input;

    var loadOtp = req.session.otp;
    console.log(loadOtp);
    if (loadOtp === OTPs) {
      function generateReferralCode(length) {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let code = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          code += characters.charAt(randomIndex);
        }
        return code;
      }

      // Example usage
      const referralCode = generateReferralCode(8);

      let cust = req.session.temp;
      const user = new User({
        name: cust.name,
        email: cust.email,
        mobile: cust.mobile,
        password: cust.password,
        status: 1,
        referal: referralCode,
      });

      const userData = await user.save();
      if (userData) {
        const token = createToken({ id: userData._id });
        res.cookie("jwt", token, { httpOnly: true, maxAge: 36000000 });

        res.status(StatusCode.SUCCESS).json({ redirect: "/home" });
      }
    } else {
      res.status(StatusCode.SUCCESS).json({ message: "OTP is invalid" });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.status(StatusCode.SUCCESS).render("login");
  } catch (error) {
    return renderError(res, error);
  }
};

const loadLogout = async (req, res) => {
  try {
    res.clearCookie("jwt");

    res.redirect("/login");
  } catch (error) {
    return renderError(res, error);
  }
};
const verifyGoogle = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.user.email });

    if (userData) {
      const token = createToken({ id: userData._id });
      res.cookie("jwt", token, { httpOnly: true, maxAge:3600000  });
      res.redirect("/home");
    } else {
      function generateReferralCode(length) {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let code = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          code += characters.charAt(randomIndex);
        }
        return code;
      }

      // Example usage
      const referralCode = generateReferralCode(8);
      const user = new User({
        name: req.user.given_name,
        email: req.user.email,
        password: "123456789",
        mobile: "1234567890",
        referralCode: referralCode,
      });
      const userData = await user.save();

      const token = createToken({ id: userData._id });
      res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });
      res.redirect("/home");
    }
  } catch (error) {
    return renderError(res, error);
  }
};
const verifyUser = async (req, res) => {
  try {
    const email = req.body.name;
    const password = req.body.pass;

    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.status) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          const token = createToken({ id: userData._id });
          res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });

          res.redirect("/home");
        } else {
          res
            .status(StatusCode.SUCCESS)
            .render("login", { message1: "your password is incorrect" });
        }
      } else {
        res.render("login", { message: "you are blocked by admin" });
      }
    } else {
      res
        .status(StatusCode.SUCCESS)
        .render("login", { message: "email is invalid" });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    res.status(StatusCode.SUCCESS).render("forgot");
  } catch (error) {
    return renderError(res, error);
  }
};

const forgotEmail = async (req, res) => {
  try {
    const email1 = req.body.name;
    const user = await User.findOne({ email: email1 });
    try {
      if (user) {
        let otpCode1 = Math.floor(1000 + Math.random() * 9000).toString();
        req.session.email1 = email1;
        req.session.otp1 = otpCode1;
        console.log(otpCode1);

        const isSend = await sendMail(email1, otpCode1);
        if (isSend) {
          res.redirect("/Verify-otp");
        } else {
          console.error("Error sending mail");
          const statusCode = StatusCode.INTERNAL_ERROR;
          const errorMessage = "Failed to send OTP mail";
          res
            .status(statusCode)
            .render("errorPage", { statusCode, errorMessage });
        }
      } else {
        res
          .status(StatusCode.SUCCESS)
          .render("forgot", { message: "Email doesnot exist" });
      }
    } catch (error) {
      const errorMessage = "Internal Server Error";
      return res
        .status(StatusCode.INTERNAL_ERROR)
        .render("errorPage", { statusCode: 500, errorMessage });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const verifyOtp = async (req, res) => {
  try {
    res.status(StatusCode.SUCCESS).render("verifyOtp");
  } catch (error) {
    return renderError(res, error);
  }
};

const insertOtp = async (req, res) => {
  try {
    let OTPs = req.body.input;
    var loadOtp1 = req.session.otp1;
    console.log(loadOtp1);
    if (loadOtp1 === OTPs) {
      res.status(StatusCode.SUCCESS).json({ redirect: "/confirmation" });
    } else {
      res.status(StatusCode.SUCCESS).json({ message: "OTP is invalid" });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const confirmation = async (req, res) => {
  try {
    res.status(StatusCode.SUCCESS).render("changePassword");
  } catch (error) {
    return renderError(res, error);
  }
};

const confirmPassword = async (req, res) => {
  try {
    let email = req.session.email1;
    const user = await User.find({ email: email });
    if (user) {
      const spassword = await securePassword("req.body.pass");
      await User.findByIdAndUpdate(user._id, {
        password: spassword,
      });
      res.status(StatusCode.SUCCESS).render("changePassword", {
        message: "Your Password Changed Successfully",
      });
    } else {
      res.status(StatusCode.INTERNAL_ERROR).render("changePassword", {
        message: "Something went wrong. Please Login",
      });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const registerOtp = async (req, res) => {
  try {
    res.status(StatusCode.SUCCESS).render("registerOtp");
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  verifyGoogle,
  loadRegister,
  insertUser,
  verifyRegister,
  loadLogin,
  verifyUser,
  forgotPassword,
  forgotEmail,
  verifyOtp,
  confirmation,
  insertOtp,
  confirmPassword,
  loadOtp,
  registerOtp,
  loadLogout,
};
