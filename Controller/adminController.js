const User = require("../model/userModel");
const Admin = require("../model/adminModel");
const Order = require("../model/orderModel");
const jwt = require("jsonwebtoken");
const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");

const createToken = (admin) => {
  const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
  return jwt.sign(admin, ADMIN_JWT_SECRET, { expiresIn: "1h" });
};

const adminRegister = async (req, res) => {
  try {
    res.status(StatusCode.SUCCESS).render("signUp");
  } catch (error) {
    return renderError(res, error);
  }
};
const verifyRegister = async (req, res) => {
  try {
    const admin = new Admin({
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
    });

    const adminData = await admin.save();

    if (adminData) {
      const token = createToken({ id: adminData._id });
      res.cookie("Adminjwt", token, { httpOnly: true, maxAge: 3600000 });
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    return renderError(res, error);
  }
};
const adminLogin = async (req, res) => {
  try {
    res.status(StatusCode.SUCCESS).render("adminLogin");
  } catch (error) {
    return renderError(res, error);
  }
};

const adminVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await Admin.findOne({ email: email });
    if (adminData) {
      if (adminData.password === password) {
        const token = createToken({ id: adminData._id });
        res.cookie("Adminjwt", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/admin/dashboard");
      } else {
        res
          .status(StatusCode.SUCCESS)
          .render("adminLogin", { message: "Password is incorrect" });
      }
    } else {
      res
        .status(StatusCode.SUCCESS)
        .render("adminLogin", { message: "Email is incorrect" });
    }
  } catch (error) {
    return renderError(res, 500, error);
  }
};

const adminForgot = async (req, res) => {
  try {
    res.status(StatusCode.SUCCESS).render("forgot");
  } catch (error) {
    return renderError(res, error);
  }
};

//logout

const loadLogout = async (req, res) => {
  try {
    res.clearCookie("Adminjwt");
    res.redirect("/admin/login");
  } catch (error) {
    return renderError(res, error);
  }
};

//user Management

const userList = async (req, res) => {
  try {
    const users = await User.find({}).sort({Date:-1});
    res.status(StatusCode.SUCCESS).render("userlist", { users: users });
  } catch (error) {
    return renderError(res, error);
  }
};

const userBlock = async (req, res) => {
  try {
    const userId = req.body.id;
    const user = await User.findOne({ _id: userId });

    const userStatus = user.status;

    if (userStatus) {
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { status: false },
        { new: true }
      );
      const userStatus = user.status;

      res.status(StatusCode.SUCCESS).json({ userStatus: userStatus });
    } else {
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { status: true },
        { new: true }
      );
      const userStatus = user.status;
      res.status(StatusCode.SUCCESS).json({ userStatus: userStatus });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  adminRegister,
  verifyRegister,
  adminLogin,
  adminForgot,
  loadLogout,
  adminVerify,
  userList,
  userBlock,
};
