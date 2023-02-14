const userModel = require("../model/user");
const userStatus = require("../model/user");
const bcrypt = require("bcrypt");
const productModel = require("../model/product");
const cartModel = require("../model/cart");
const wishlistModel = require("../model/wishlist");
const orderModel = require("../model/order");
const accountSid = "ACd37c40052d966d5486e50c6fda570b9e";
const authToken = "676529fd675a0eb2cf60c0c9e8a9c4c3";
const client = require("twilio")(accountSid, authToken);
const serviceSid = "VA71d60f9e51b03fb644c8590c04366716";
const category = require("../model/category");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const couponModel = require("../model/coupon");
const bannerModel = require("../model/banner");
const { rmSync } = require("fs");

let loggedIn = false;
let Err = null;
let loginErr;
let viewcart;

module.exports = {
  getUserLogin: (req, res) => {
    res.render("User/login", { loginErr, user: req.session.user });
    loginErr = null;
  },

  getUserHome: async (req, res) => {
    try {
      if (loggedIn) {
        productModel.find({}, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            let user = req.session.user;
            res.render("User/index", { user, result });
          }
        });
      } else {
        bannerData = await bannerModel.find();
        productModel.find({}, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            res.render("User/index", { user: false, result, bannerData });
          }
        });
      }
    } catch {
      res.redirect("/404");
    }
  },

  getUserSingnin: (req, res) => {
    res.render("User/signup", { user: req.session.user });
  },

  postUserSignup: (req, res) => {
    doSms = (userData) => {
      return new Promise(async (resolve, reject) => {
        let response = {};
        await client.verify
          .services(serviceSid)
          .verifications.create({
            to: `+91${userData.Phone}`,
            channel: "sms",
          })
          .then(() => {
            response.valid = true;

            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
    };
    doSms(req.body);

    userModel.find({ email: req.body.email }, async (err, data) => {
      if (data.length == 0) {
        // Confirm password validation
        if (req.body.Password === req.body.ConfirmPassword) {
          //inserting the data into database
          const user = new userModel({
            Firstname: req.body.Firstname,
            Lastname: req.body.Lastname,
            email: req.body.email,
            Phone: req.body.Phone,
            password: await bcrypt.hash(req.body.password, 10),

            userStatus: "active",
          });
          await user.save();

          req.session.userData = user;
          return res.render("User/userotp", { user: false });
        } else {
          console.log("err");
          Err = "The password is not matched";
          res.redirect("/signin");
        }
      } else {
        Err = "Invalid Email";
        res.redirect("/signin");
      }
    });
  },
  postUserloigin: async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (user) {
      if (user.userStatus === "active") {
        bcrypt.compare(req.body.password, user.password).then((data) => {
          if (data) {
            loggedIn = true;
            req.session.user = user;
            res.redirect("/");
          } else {
            loginErr = "Invalied password";
            res.render("/login");
          }
        });
      } else {
        loginErr = "you are blocked by admin";
        res.redirect("/login");
      }
    } else {
      logginErr = "Invalied Email";
      res.redirect("/login");
    }
  },
  getUserLogout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },
  getotp: (req, res) => {
    res.render("User/userotp", { user: false });
  },
  PostOtp: async (req, res) => {
    otpVerify = (otpData, userData) => {
      return new Promise(async (resolve, reject) => {
        await client.verify
          .services(serviceSid)
          .verificationChecks.create({
            to: `+91${userData.Phone}`,
            code: otpData,
          })
          .then((verifications) => {
            resolve(verifications.valid);
          });
      });
    };
    verified = await otpVerify(req.body.otp, req.session.userData);
    console.log(verified);
    if (!verified) {
      id = req.session.userData._id;

      await userModel.findOneAndDelete({ _id: id });
      return res.json({ message: "this is wrong page" });
    }

    return res.redirect("/");
  },
  getContact: (req, res) => {
    let user = req.session.user;
    res.render("User/usercontact", { user });
  },
  getHome: (req, res) => {
    let user = req.session.user;
    res.render("User/index", { user });
  },
  getUserShop: async (req, res) => {
    const categorys = await category.find();
    productModel.find({}, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        let user = req.session.user;

        res.render("User/usershop", { user, result, categorys });
      }
    });
  },
  getuserCart: async (req, res) => {
    if (loggedIn) {
      let productId = req.params.id;

      let userId = req.session.user._id;

      let products = await productModel.find({ _id: productId });

      let productExist = await cartModel.aggregate([
        { $match: { UserId: userId } },
        { $unwind: "$products" },
        { $match: { "products.productId": productId } },
      ]);
      cartModel.findOne({ UserId: userId }, async (err, data) => {
        if (data) {
          if (productExist.length !== 0) {
            await cartModel.updateOne(
              { UserId: userId, "products.productId": productId },
              {
                $inc: {
                  "products.$.quantity": 1,
                  totalprice: products[0].price,
                },
              }
            );
          } else {
            await cartModel.updateOne(
              { UserId: userId },
              {
                $inc: {
                  totalprice: products[0].price,
                },
                $push: {
                  products: {
                    productId: productId,
                    productname: products[0].productname,
                    price: products[0].price,
                    productImg: products[0].productImg,
                    quantity: 1,
                  },
                },
              }
            );
          }
        } else {
          const cart = new cartModel({
            UserId: userId,
            totalprice: products[0].price,
            products: {
              productId: productId,
              productname: products[0].productname,
              price: products[0].price,
              productImg: products[0].productImg,
              quantity: 1,
            },
          });
          cart.save();
        }
      });
    } else {
      res.redirect("/login");
    }
  },
  getcart: async (req, res) => {
    if (loggedIn) {
      let userId = req.session.user._id;
      let viewcart = await cartModel
        .findOne({ UserId: userId })
        .populate("products.productId")
        .exec();

      if (viewcart === null) {
        cartModel.find({}, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            let user = req.session.user;
            res.render("User/cart", { user, result, viewcart });
          }
        });
      } else {
        if (viewcart.products.length === 0) {
          cartModel.find({}, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              let user = req.session.user;
              res.render("User/cart", { user, result, viewcart });
            }
          });
        } else {
          if (viewcart.products.length !== 0) {
            cartModel.find({}, (err, result) => {
              if (err) {
                console.log(err);
              } else {
                let user = req.session.user;

                const totalBill = viewcart.products.map((value) => {
                  return value.price * value.quantity;
                });

                res.render("User/cart", { user, result, viewcart });
              }
            });
          }
        }
      }
    } else {
      res.redirect("/login");
    }
  },

  getProductdetails: (req, res) => {
    productModel.find({ _id: req.params.id }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        let user = req.session.user;
        res.render("User/productdetails", { user, result });
      }
    });
  },

  Postusercartinc: async (req, res) => {
    if (loggedIn) {
      const _id = req.params.id;

      userId = req.session.user._id;
      let cartData = await cartModel.findOne({ UserId: userId });

      let productIndex = cartData.products.findIndex((p) => p.productId == _id);

      cartData.products[productIndex].quantity += 1;
      cartData.totalprice =
        Number(cartData.totalprice) +
        Number(cartData.products[productIndex].price);
      if (cartData.products[productIndex].quantity > 0) {
        cartData.save().then((data) => {
          res.json({ status: true });
        });
      } else {
        res.json({ error: true });
      }
    }
  },

  postuserminues: async (req, res) => {
    if (loggedIn) {
      const _id = req.params.id;
      userId = req.session.user._id;
      let cartData = await cartModel.findOne({ UserId: userId });
      let productIndex = cartData.products.findIndex((p) => p.productId == _id);
      cartData.products[productIndex].quantity -= 1;
      cartData.totalprice =
        Number(cartData.totalprice) -
        Number(cartData.products[productIndex].price);
      if (cartData.products[productIndex].quantity > 0) {
        cartData.save().then((data) => {
          res.json({ status: true });
        });
      } else {
        res.json({ error: true });
      }
    }
  },
  getcheckout: async (req, res, next) => {
    try {
      if (loggedIn) {
        let coupon = await couponModel.find({});
        let totalprice = req.params.total;
        let user = req.session.user;
        let userId = req.session.user._id;
        let viewcart = await cartModel
          .findOne({ userId: userId })
          .populate("products.productId")
          .exec();
        let userAddress = await userModel
          .findOne({ _id: userId })
          .populate("Address._id")
          .exec();

        res.render("User/usercheckout", {
          user,
          totalprice,
          userId,
          viewcart,
          userAddress,
          coupon,
        });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  postAddaddress: async (req, res) => {
    if (loggedIn) {
      let userId = req.session.user._id;
      if (req.body) {
        const data = req.body;
        let addressId;
        if (data.Address) {
          addressId = data.Address;
        } else {
          const addressData = new adress({
            Firstname: data.Firstname,
            Lastname: data.Lastname,
            Address: data.Address,
            City: data.city,
            Email: data.email,
            Phone: data.phone,
          });

          await addressData.save();

          addressId = addressData.id;
        }
      }
    }
  },
  getwishlist: async (req, res) => {
    if (loggedIn) {
      let userId = req.session.user._id;
      let viewWishlist = await wishlistModel
        .findOne({ UserId: userId })
        .populate("products.productId")
        .exec();

      wishlistModel.find({}, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          let user = req.session.user;
          res.render("User/wishlist", { user, result, viewWishlist, userId });
        }
      });
    } else {
      res.redirect("/login");
    }
  },
  getAddtowishlist: async (req, res) => {
    try {
      if (loggedIn) {
        let productId = req.params.id;
        let userId = req.session.user._id;
        let products = await productModel.find({ _id: productId });
        let productExist = await wishlistModel.aggregate([
          { $match: { UserId: userId } },
          { $unwind: "$products" },
          { $match: { "products.productId": productId } },
        ]);
        wishlistModel.findOne({ UserId: userId }, async (err, data) => {
          if (data !== null) {
            if (productExist.length === 0) {
              await wishlistModel.updateOne(
                { UserId: userId },
                {
                  $push: {
                    products: {
                      productId: productId,
                      productname: products[0].productname,
                      price: products[0].price,
                      productImg: products[0].productImg,
                    },
                  },
                }
              );
            }
          } else {
            const wishlist = new wishlistModel({
              UserId: userId,
              products: {
                productId: productId,
                productname: products[0].productname,
                price: products[0].price,
                productImg: products[0].productImg,
                quantity: 1,
              },
            });
            wishlist.save();
          }
        });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  getdeletproduct: async (req, res) => {
    try {
      if (loggedIn) {
        let userId = req.session.user;
        let productId = req.params.id;
        let productExist = await wishlistModel.aggregate([
          { $match: { UserId: userId } },
          { $unwind: "$products" },
          { $match: { "products.productId": productId } },
        ]);
        wishlistModel.findOne({ UserId: userId }, async (err, data) => {
          if (data) {
            if (productExist.length === 0) {
              await wishlistModel.updateOne(
                { UserId: userId },
                {
                  $pull: {
                    products: {
                      productId: productId,
                    },
                  },
                }
              );
            }
          }
        });
        res.redirect("/wishlist");
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  getUserProfile: async (req, res, next) => {
    try {
      if (loggedIn) {
        let user = req.session.user;
        let viewAddress = await userModel
          .find({ _id: user._id })
          .populate("Address._id")
          .exec();
        console.log(viewAddress);
        res.render("User/profile", { user, viewAddress });
        // addressErr = null
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },
  categoryfilter: async (req, res) => {
    const categorys = await category.find();
    let categoryid = req.params.data;
    productModel.find({ category: categoryid }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        let user = req.session.user;

        res.render("User/usershop", { user, result, categorys });
      }
    });
  },
  getdeleteCart: async (req, res, next) => {
    try {
      if (loggedIn) {
        let userId = req.session.user._id;
        let productId = req.params.id;
        let productExist = await cartModel.aggregate([
          { $match: { UserId: userId } },
          { $unwind: "$products" },
          { $match: { "products.productId": productId } },
        ]);
        cartModel.findOne({ UserId: userId }, async (err, data) => {
          if (data) {
            if (productExist.length !== 0) {
              await cartModel.updateOne(
                { UserId: userId },
                {
                  $pull: {
                    products: {
                      productId: productId,
                    },
                  },
                }
              );
            }
          }
        });
        res.json({ status: true });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  geterror: (req, res) => {
    res.render("User/error");
  },

  // postAddress :async(req,res)=>{
  //   try{
  //     if(loggedIn){
  //       const userAddress=req.body;

  //       let userId = req.session.user._id

  //       await userModel.findByIdAndUpdate(
  //         {_id:userId},
  //         {
  //           $push:{
  //             Address:{
  //                 Firstname:userAddress.Firstname,
  //                 Lastname:userAddress.Lastname,
  //                 Phone:userAddress.Phone,
  //                 email:userAddress.email,
  //                 city:userAddress.city,
  //                 LandMark:userAddress.landmark,
  //                 Pincode:userAddress.pincode
  //               },
  //           },

  //         }
  //       )

  //     }else{
  //       res.redirect('/login')
  //     }

  //     res.redirect('/Myprofile')
  //   }catch (err){
  //    console.log(err);
  //   }
  // },

  // getviewAddress :async(req,res)=>{
  //  if(loggedIn){
  //   let user = req.session.user;
  //   let userId = req.session.user._id
  //    const addressData= await userModel.findById({_id:userId})

  //     res.render('User/view-address',{userId,addressData,user})

  //  }else{
  //   res.redirect('/login')
  //  }

  // },
  postCheckout: async (req, res) => {
    if (loggedIn) {
      let discount;
      let totalPrice = req.params.id;

      let coupon = req.session.coupon;
      console.log(coupon);
      if (coupon !== undefined) {
        discount = (totalPrice * coupon.discount) / 100;
      } else {
        discount = 0;
      }

      let finalTotal = totalPrice - discount;
      let userId = req.session.user._id;
      let cart = await cartModel
        .findOne({ UserId: userId })
        .populate("products.productId")
        .exec();
      let cartProducts = cart.products;
      let productArray = [];
      for (let i = 0; i < cartProducts.length; i++) {
        let orderProducts = {};
        orderProducts.productId = cartProducts[i].productId;
        orderProducts.productname = cartProducts[i].productname;
        orderProducts.price = cartProducts[i].price;
        orderProducts.quantity = cartProducts[i].quantity;
        orderProducts.productImg = cartProducts[i].productImg;
        productArray.push(orderProducts);
      }

      if (req.body.payment === "COD") {
        orderModel.findOne({ UserId: userId }, async (err, data) => {
          if (data === null) {
            const order = new orderModel({
              UserId: userId,
              paymentMode: req.body.payment,
              totalPrice: totalPrice,
              paymentStatus: "Pending",
              Date: new Date().toJSON().slice(0, 10),
              Products: productArray,
              Address: {
                Firstname: req.body.Firstname,
                Lastname: req.body.Lastname,
                Address: req.body.Address,
                City: req.body.city,
                Phone: req.body.Phone,
                Landmark: req.body.landmark,
                pincode: req.body.pincode,
                Email: req.body.email,
              },
            });
            order.save();

            await cartModel.deleteOne({ UserId: userId });
          } else {
            const order = new orderModel({
              UserId: userId,
              paymentMode: req.body.payment,
              totalPrice: totalPrice,
              paymentStatus: "Pending",
              Date: new Date().toJSON().slice(0, 10),
              Products: productArray,
              Address: {
                Firstname: req.body.Firstname,
                Lastname: req.body.Lastname,
                Address: req.body.Address,
                City: req.body.city,
                Phone: req.body.Phone,
                Landmark: req.body.landmark,
                pincode: req.body.pincode,
                Email: req.body.email,
              },
            });
            order.save();

            await cartModel.deleteOne({ UserId: userId });
          }
        });

        let user = req.session.user;
        res.json({ codSuccess: true });
      } else {
        const order = new orderModel({
          UserId: userId,
          paymentMode: req.body.payment,
          totalPrice: totalPrice,
          paymentStatus: "Pending",
          Date: new Date().toJSON().slice(0, 10),
          Products: productArray,
          Address: {
            Firstname: req.body.Firstname,
            Lastname: req.body.Lastname,
            Address: req.body.Address,
            City: req.body.city,
            Phone: req.body.Phone,
            Landmark: req.body.landmark,
            pincode: req.body.pincode,
            Email: req.body.email,
          },
        });
        order.save();

        req.session.orderId = order._id;

        var instance = new Razorpay({
          key_id: "rzp_test_SN6n6I4ZbNE9FY",
          key_secret: "KMexa77VIzm8CQOyRvvqXsK4",
        });

        var options = {
          amount: totalPrice * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + req.session.orderId,
        };
        instance.orders.create(options, function (err, order) {
          res.json(order);
        });
      }
    } else {
      res.redirect("/login");
    }
    // } catch (error) {
    //     next(error)
    // }
  },

  postverifyPayment: async (req, res) => {
    console.log(req.body);

    if (loggedIn) {
      console.log("in");
      let userData = req.session.user;
      userId = userData._id;
      let details = req.body;

      let hmac = crypto.createHmac("sha256", "KMexa77VIzm8CQOyRvvqXsK4");
      hmac.update(
        details.payment.razorpay_order_id +
          "|" +
          details.payment.razorpay_payment_id
      );
      hmac = hmac.digest("hex");
      if (hmac == details.payment.razorpay_signature) {
        orderId = req.session.orderId;
        await orderModel.findByIdAndUpdate(orderId, {
          paymentStatus: "Pending",
        });
        await cartModel.findOneAndDelete({ UserId: userId });
        res.json({ status: true });
      } else {
        res.json({ status: "false" });
      }
    } else {
      res.redirect("/login");
    }
  },
  getPlacedOrder: (req, res, next) => {
    try {
      if (loggedIn) {
        let user = req.session.user;
        res.render("User/placeorder", { user });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  postapplyCoupon: (req, res, next) => {
    try {
      if (loggedIn) {
        str = req.params.id;
        let array = str.split("!");
        let couponCode = array[0];
        let orderTotal = array[1];

        let userId = req.session.user._id;
        couponModel.find({ CouponCode: couponCode }, (err, data) => {
          if (data.length !== 0) {
            userModel.findOne({ _id: userId }, async (err, user) => {
              if (user) {
                let itemIndex = user.coupons.findIndex(
                  (p) => p.couponId == data[0]._id
                );
                console.log(itemIndex);
                if (itemIndex === -1) {
                  let date = new Date().toJSON().slice(0, 10);
                  if (date <= data[0].ExpiryDate) {
                    let discount = (orderTotal * data[0].Percentage) / 100;

                    if (Number(discount) <= Number(data[0].Maxamount)) {
                      if (data[0].Minamount <= orderTotal) {
                        await userModel.updateOne(
                          { _id: userId },
                          {
                            $push: {
                              coupons: {
                                couponId: data[0]._id,
                                CouponName: data[0].CouponName,
                                CouponCode: data[0].CouponCode,
                                Percentage: data[0].Percentage,
                                Minamount: data[0].Minamount,
                                Maxamount: data[0].Maxamount,
                                ExpiryDate: data[0].ExpiryDate,
                              },
                            },
                          }
                        );

                        let couponObj = {
                          discount: data[0].Percentage,
                          couponId: data[0]._id,
                        };

                        req.session.coupon = couponObj;
                        res.json({ couponObj });
                      } else {
                        req.session.couponErr =
                          "This coupon is not Applicable to this amount!";
                        let couponErr = req.session.couponErr;
                        res.json({ couponErr });
                      }
                    } else {
                      await userModel.updateOne(
                        { _id: userId },
                        {
                          $push: {
                            coupons: {
                              couponId: data[0]._id,
                              CouponName: data[0].CouponName,
                              CouponCode: data[0].CouponCode,
                              Percentage: data[0].Percentage,
                              Minamount: data[0].Minamount,
                              Maxamount: data[0].Maxamount,
                              ExpiryDate: data[0].ExpiryDate,
                            },
                          },
                        }
                      );
                      let couponLimit = {
                        Maxamount: data[0].MaxAmount,
                        discount: data[0].Percentage,
                        couponId: data[0]._id,
                      };
                      req.session.coupon = couponLimit;
                      res.json({ couponLimit });
                    }
                  } else {
                    req.session.couponErr = "This Coupon is Expired!";
                    let couponErr = req.session.couponErr;
                    res.json({ couponErr });
                  }
                } else {
                  req.session.couponErr = "This Coupon is already used!";
                  let couponErr = req.session.couponErr;
                  res.json({ couponErr });
                }
              }
            });
          }
        });
      }
    } catch (error) {
      next(error);
    }
  },

  postAddress: (req, res) => {
    try {
      if (loggedIn) {
        let userId = req.session.user._id;
        userModel.find({ _id: userId }, async (err, data) => {
          if (data) {
            console.log("its Working");
            console.log(req.body);
            await userModel.updateOne(
              { _id: userId },
              {
                $push: {
                  Address: {
                    Address: req.body.address,
                    City: req.body.city,
                    Phone: req.body.phone,
                    Landmark: req.body.landmark,
                    Pincode: req.body.pincode,
                  },
                },
              }
            );
          }
        });
        res.redirect("/myprofile");
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },
  getdeleteAddress:async(req,res,next)=>{
    try {
        if(loggedIn){
        let userId = req.session.user._id
        let addressId = req.params.id
       await userModel.findOne({_id:userId},async(err,data)=>{
            if(data){
                
                   await  userModel.updateOne({_id:userId},{
                        $pull : {
                            Address : {
                                _id : addressId
                            }
                        }
                    }) 
                
            }     
            res.json({status:true})   
        })
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        next(error)
    }
    
    
},
  getMyorders: async (req, res) => {
    if (loggedIn) {
      let userId = req.session.user._id;
      let vieworders = await orderModel
        .find({ UserId: userId })
        .populate("Products.productId")
        .exec();
      let viewOrders = vieworders.reverse();
      let user = req.session.user;
      res.render("User/myorders", { user, viewOrders });
    } else {
      res.redirect("/login");
    }
  },
  getCancelOrder: async (req, res) => {
    try {
      if (loggedIn) {
        let orderId = req.params.id;
        await orderModel.updateOne(
          { _id: orderId },
          {
            $set: {
              paymentStatus: "Cancelled",
            },
          }
        );
        res.json({ status: true });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },
};
