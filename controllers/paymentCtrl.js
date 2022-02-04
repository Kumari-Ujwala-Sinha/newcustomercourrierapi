const Product = require("../models/productModel");
const { generateRazorpayOrder } = require("./FlowController");
const productCtrl = require("./productCtrl");

module.exports.createProduct = async (req, res) => {
    
  
    try {
        const {
            deliveryitem,
            Distance,
            Length,
            addresstodeli,
            deliveryboy,
            category,
            deliveryMode,
            image,
            ServiceType,
            SedndingAddress,
            Price,
            secureProduct,
            Weight,
            CourierType,
            CourierInfo,
            Width,
            Height
          } = req.body;
          const newProduct = new Product({
            deliveryitem,
            customer:req.user.id,
            addresstodeli,
            deliveryboy,
            category,
            deliveryMode,
            image,
            ServiceType,
            SedndingAddress,
            Price,
            secureProduct,
            Weight,
            CourierType,
            CourierInfo,
            Distance,
            Width,
            Height,
            Length
          });
          await newProduct.save();
      
      generateRazorpayOrder(newProduct._id, req.body.Price).then(
        (response) => {
          console.log(response);
          res.status(200).json(response);
        }
      );
    } catch (error) {
      res.status(400).json(error);
    }
  };
  
  
  
  
  module.exports.verifyPayments = async (req, res) => {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(req.body.order_id + "|" + req.body.payment_id);
    const digest = hmac.digest("hex");
    console.log(digest);
    if (digest === req.body.signature) {
      await Product.findByIdAndUpdate(req.body.order.receipt,{payment_status :"success"});
      
      console.log("payment successfull");
      res.status(200).json({
        success: true,
        msg: "payment successfull",
      });
    } else {
      console.log("payment failed");
      let booking = await Product.findById(req.body.order.receipt);
     
     
     
      await Product.findByIdAndRemove(req.body.order.receipt);
      res.status(400).json({
        success: false,
        msg: "payment failed",
      });
    }
  };