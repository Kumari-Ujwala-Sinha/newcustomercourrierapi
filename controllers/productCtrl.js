const Product = require("../models/productModel");
const { generateRazorpayOrder } = require("./FlowController");

const productCtrl = {
  createOrder: async (req, res) => {
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
         
          res.status(200).json(response);
        }
      );
    } catch (error) {
      res.status(400).json(error);
    }
  },
  verifyPayments: async (req, res) => {
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
  },
  getProducts: async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getProductbyUsers: async (req, res) => {
    try {
      const product = await Product.find({ deliveryboy: req.user.id });

      res.json(product);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getProductdetails: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      res.json(product);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createProduct: async (req, res) => {
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
      res.json({ msg: "Created a Product" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ msg: "Deleted a Product" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const {
        deliveryitem,
        addresstodeli,
        deliveryboy,
        deliveryType,
        deliveryaccepted,
      } = req.body;
      await Product.findOneAndUpdate(
        { _id: req.params.id },
        {
          deliveryaccepted,
          deliveryitem,
          addresstodeli,
          deliveryboy,
          deliveryType,
        }
      );

      res.json({ msg: "Updated a Product" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updatepickedStatus: async (req, res) => {
    try {
      const { pickedStatus } = req.body;
      await Product.findOneAndUpdate({ _id: req.params.id }, { pickedStatus });

      res.json({ msg: "Updated the picked status of the Product" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updatedeliveredStatus: async (req, res) => {
    try {
      const { deliveredStatus } = req.body;
      await Product.findOneAndUpdate(
        { _id: req.params.id },
        { deliveredStatus }
      );

      res.json({ msg: "Updated delivered status of the Product" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updatedeliveryaccepted: async (req, res) => {
    try {
      const { deliveryaccepted } = req.body;
      await Product.findOneAndUpdate(
        { _id: req.params.id },
        { deliveryaccepted }
      );

      res.json({ msg: "Updated delivery acceptence of the Product" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deliveryboydelivered: async (req, res) => {
    try {
      const deliveredProducts = await Product.find({
        deliveryboy: req.user.id,
        deliveryaccepted: "accepted",
        deliveredStatus: true,
        pickedStatus: true,
      });

      res.json(deliveredProducts);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deliveryboytobedelivered: async (req, res) => {
    try {
      const deliveredProducts = await Product.find({
        deliveryboy: req.user.id,
        deliveryaccepted: "accepted",
        deliveredStatus: false,
        pickedStatus: true,
      });

      res.json(deliveredProducts);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deliveryboytoaccept: async (req, res) => {
    try {
      const deliveryboytoaccept = await Product.find({
        deliveryboy: req.user.id,
        deliveryaccepted: "toaccept",
        pickedStatus: false,
        deliveredStatus: false,
      });

      res.json(deliveryboytoaccept);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deliveryboytopicked: async (req, res) => {
    try {
      const deliveryboytoaccept = await Product.find({
        deliveryboy: req.user.id,
        deliveryaccepted: "accepted",
        pickedStatus: false,
        deliveredStatus: false,
      });

      res.json(deliveryboytoaccept);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = productCtrl;
