const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const wishlist = require("../model/wishlistModel");
const { sendMail } = require("../helpers/nodemailer");
const Category = require("../model/categoryModel");
const Wallet = require("../model/walletModel");
const StatusCode = require("../helpers/statusCode");

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
        // if(req.session.refferal == null){

        // }
        // else{
        //     const newWallet = new Wallet({
        //         userId: userData._id,
        //         details: [{
        //             amount: 500,
        //             transactionType: "Credited",
        //             method: "refferal",
        //             date: Date.now()
        //         }]
        //     });
        //     await newWallet.save()
        // }
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

const loadShop = async (req, res) => {
  try {
    let searchQuery = req.query.searchQuery;
    let categoryName = req.query.selectedCategory;
    let selectedValue = req.query.selectedValue;
    let page = parseInt(req.query.page);

    let limit = 5;
    let skip = (page - 1) * limit;

    let userId = req.id;

    if (searchQuery !== "" && categoryName == "" && selectedValue == "option") {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      })
        .skip(skip)
        .limit(limit);
      res.status(StatusCode.SUCCESS).render("shop", {
        products: products,
        quantity: quantity,
        total: total,
        categories: categories,
        searchQuery: searchQuery,
        categoryName: categoryName,
        selectedValue: selectedValue,
      });
    } else if (
      searchQuery == "" &&
      categoryName !== "" &&
      selectedValue == "option"
    ) {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });

      const products = await Product.find({
        status: true,
        category: categoryName,
      })
        .skip(skip)
        .limit(limit);
      res.status(StatusCode.SUCCESS).render("shop", {
        products: products,
        quantity: quantity,
        total: total,
        categories: categories,
        searchQuery: searchQuery,
        categoryName: categoryName,
        selectedValue: selectedValue,
      });
    } else if (
      searchQuery == "" &&
      categoryName == "" &&
      selectedValue !== "option"
    ) {
      if (selectedValue == "option1") {
        const carts = await Cart.find({ userId: userId });

        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });
        const products = await Product.find({ status: true })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option2") {
        const carts = await Cart.find({ userId: userId });

        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });
        const products = await Product.find({ status: true })
          .sort({ name: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option3") {
        const carts = await Cart.find({ userId: userId });

        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });
        const products = await Product.find({ status: true })
          .sort({ disprice: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option4") {
        const carts = await Cart.find({ userId: userId });

        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });

        const products = await Product.find({ status: true })
          .sort({ disprice: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else {
        const carts = await Cart.find({ userId: userId });

        let quantity = 0;
        let total = 0;
        carts.forEach((cart) => {
          quantity = quantity + cart.quantity;
          total = total + cart.total;
        });
        const categories = await Category.find({ delete: true });
        const products = await Product.find({ status: true })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      }
    } else if (
      searchQuery !== "" &&
      categoryName !== "" &&
      selectedValue == "option"
    ) {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      let categories = await Category.find({ delete: true });
      const products = await Product.find({
        status: true,
        category: categoryName,
        name: { $regex: new RegExp(searchQuery, "i") },
      })
        .skip(skip)
        .limit(limit);

      res.status(StatusCode.SUCCESS).render("shop", {
        products: products,
        quantity: quantity,
        total: total,
        categories: categories,
        searchQuery: searchQuery,
        categoryName: categoryName,
        selectedValue: selectedValue,
      });
    } else if (
      searchQuery !== "" &&
      categoryName == "" &&
      selectedValue !== "option"
    ) {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      if (selectedValue == "option1") {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option2") {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ name: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option3") {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ disprice: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option4") {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ disprice: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else {
        const products = await Product.find({
          status: true,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      }
    } else if (
      searchQuery == "" &&
      categoryName !== "" &&
      selectedValue !== "option"
    ) {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      if (selectedValue == "option1") {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option2") {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ name: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option3") {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ disprice: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option4") {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ disprice: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else {
        const products = await Product.find({
          status: true,
          category: categoryName,
        })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      }
    } else if (
      searchQuery !== undefined &&
      searchQuery !== "" &&
      categoryName !== "" &&
      selectedValue !== "option"
    ) {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      if (selectedValue == "option1") {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option2") {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ name: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option3") {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ disprice: 1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else if (selectedValue == "option4") {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ disprice: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      } else {
        const products = await Product.find({
          status: true,
          category: categoryName,
          name: { $regex: new RegExp(searchQuery, "i") },
        })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);

        res.status(StatusCode.SUCCESS).render("shop", {
          products: products,
          quantity: quantity,
          total: total,
          categories: categories,
          searchQuery: searchQuery,
          categoryName: categoryName,
          selectedValue: selectedValue,
        });
      }
    } else {
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;
      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      const categories = await Category.find({ delete: true });
      const products = await Product.find({ status: true })
        .skip(skip)
        .limit(limit);

      res.status(StatusCode.SUCCESS).render("shop", {
        products: products,
        quantity: quantity,
        total: total,
        categories: categories,
        searchQuery: searchQuery,
        categoryName: categoryName,
        selectedValue: selectedValue,
      });
    }
  } catch (error) {
    const errorMessage = "Internal Server Error";
    return res
      .status(500)
      .render("errorPage", { statusCode: 500, errorMessage });
  }
};

const loadSearch = async (req, res) => {
  const searchQuery = req.body.query;
  const categoryId = req.body.category;
  const option = req.body.selectedValue;

  try {
    if (option === "option" || option == undefined) {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      });

      res.json(products);
    } else if (option == "option1") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ name: 1 });

      res.json(products);
    } else if (option == "option2") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ name: -1 });

      res.json(products);
    } else if (option == "option3") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ disprice: 1 });

      res.json(products);
    } else if (option == "option4") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ disprice: -1 });

      res.json(products);
    } else if (option == "option5") {
      const category = await Category.findOne({ _id: categoryId });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ date: -1 });

      res.json(products);
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const SearchInput = async (req, res) => {
  const searchQuery = req.body.query;

  const option = req.body.selectedValue;

  try {
    if (option === "option" || option == undefined) {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      });

      res.json(products);
    } else if (option == "option1") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ name: 1 });

      res.json(products);
    } else if (option == "option2") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ name: -1 });

      res.json(products);
    } else if (option == "option3") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ disprice: 1 });

      res.json(products);
    } else if (option == "option4") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ disprice: -1 });

      res.json(products);
    } else if (option == "option5") {
      const products = await Product.find({
        status: true,
        name: { $regex: new RegExp(searchQuery, "i") },
      }).sort({ date: -1 });

      res.json(products);
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const loadSortAZ = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });
      const name = category.name;
      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ name: 1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ name: 1 });
      // const categories = await
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .statusCode(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const loadSortZA = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });
      const name = category.name;
      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ name: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ name: -1 });
      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .status(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const highToLow = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });

      const name = category.name;

      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ disprice: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ disprice: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .status(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const lowToHigh = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });
      const name = category.name;
      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ disprice: 1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ disprice: 1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .status(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const newArrivals = async (req, res) => {
  try {
    if (req.query.id !== undefined) {
      const categoryId = req.query.id;
      const userId = req.id;

      const category = await Category.findOne({ _id: req.query.id });
      const name = category.name;
      const products = await Product.find({
        status: true,
        category: name,
      }).sort({ data: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });
      res.status(StatusCode.SUCCESS).render("shopCategory", {
        products: products,
        total: total,
        category: categoryId,
      });
    } else {
      const userId = req.id;
      const products = await Product.find().sort({ date: -1 });

      const carts = await Cart.find({ userId: userId });

      let quantity = 0;
      let total = 0;

      carts.forEach((cart) => {
        quantity = quantity + cart.quantity;
        total = total + cart.total;
      });

      res
        .status(StatusCode.SUCCESS)
        .render("shop", { products: products, total: total });
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
      res.cookie("jwt", token, { httpOnly: true, maxAge: 360000 });
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
      res.cookie("jwt", token, { httpOnly: true, maxAge: 600000000 });
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
          res.cookie("jwt", token, { httpOnly: true, maxAge: 600000000 });

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
    console.log(OTPs);
    var loadOtp1 = req.session.otp1;
    console.log(loadOtp1);
    if (loadOtp1 === OTPs) {
      res.status(StatusCode.SUCCESS).json({ redirect: "/confirmation" });
    } else {
      res.status(StatusCode.BAD_REQUEST).json({ message: "OTP is invalid" });
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
      res
        .status(StatusCode.INTERNAL_ERROR)
        .render("changePassword", {
          message: "Something went wrong. Please Login",
        });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const loadHome = async (req, res) => {
  try {
    const userId = req.id;

    const products = await Product.find({ status: true });

    const wishlistCount = await wishlist.countDocuments({ userId: userId });

    const categories = await Category.find({ delete: true });

    res.status(StatusCode.SUCCESS).render("home", {
      product: products,
      wishlistCount: wishlistCount,
      categories: categories,
      userId: userId,
    });
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

const productProfile = async (req, res) => {
  try {
    const userId = req.id;

    const productId = req.query.id;
    const products = await Product.findOne({ _id: productId });
    const category = await Category.findOne({ name: products.category });
    const categories = await Category.find({ delete: true });
    const similarProducts = await Product.find({
      status: true,
      category: products.category,
    });
    res.render("productProfile", {
      products: products,
      similarProducts: similarProducts,
      category: category,
      userId: userId,
      categories: categories,
    });
  } catch (error) {
    return renderError(res, error);
  }
};

const insertWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const productId = req.body.productId;

    const wishlistData = await wishlist.findOne({
      userId: userId,
      productId: productId,
    });
    if (wishlistData) {
      res.status(StatusCode.SUCCESS).json({ success: true });
    } else {
      const wishlistData = new wishlist({
        userId: userId,
        productId: productId,
      });
      await wishlistData.save();
    }
    res.status(StatusCode.SUCCESS).json({ success: true });
  } catch (error) {
    return renderError(res, error);
  }
};

const showWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const categories = await Category.find({ delete: true });
    const wishlistData = await wishlist
      .find({ userId: userId })
      .populate("userId")
      .populate("productId");

    res.status(StatusCode.SUCCESS).render("wishlist", {
      wishlistData: wishlistData,
      categories: categories,
    });
  } catch (error) {
    return renderError(res, error);
  }
};

const removeWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const productId = req.query.id;
    await wishlist.findOneAndDelete({ productId: productId });

    await wishlist
      .find({ userId: userId })
      .populate("userId")
      .populate("productId");
    res.redirect("/show-wishlist");
  } catch (error) {
    return renderError(res, error);
  }
};

//categories

const sportShoe = async (req, res) => {
  try {
    const userId = req.id;
    const categoryId = req.query.id;
    const category = await Category.findOne({ _id: req.query.id });
    const name = category.name;
    const products = await Product.find({ status: true, category: name });
    const categories = await Category.find({ delete: true });

    const carts = await Cart.find({ userId: userId });

    let quantity = 0;
    let total = 0;
    carts.forEach((cart) => {
      quantity = quantity + cart.quantity;
      total = total + cart.total;
    });
    res.status(StatusCode.SUCCESS).render("shopCategory", {
      products: products,
      total: total,
      quantity: quantity,
      category: categoryId,
      categories: categories,
    });
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
  loadHome,
  verifyOtp,
  confirmation,
  insertOtp,
  confirmPassword,
  loadOtp,
  registerOtp,
  loadShop,
  loadSearch,
  SearchInput,
  loadSortAZ,
  loadSortZA,
  highToLow,
  lowToHigh,
  newArrivals,
  productProfile,
  loadLogout,
  insertWishlist,
  showWishlist,
  removeWishlist,
  sportShoe,
};
