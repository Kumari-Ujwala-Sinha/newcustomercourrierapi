const Razorpay = require("razorpay");


const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.generateRazorpayOrder = (orderId, amount) => {
  console.log(orderId)
  console.log(amount)
  return new Promise((resolve, reject) => {
    instance.orders.create(
      {
        amount: amount * 100,
        currency: "INR",
        receipt: "" + orderId,
        payment_capture: 1,
      },
      (err, order) => {
        if (err) {
          reject(err);
          console.log("error")
          console.log(err)
        } else {
          resolve(order);
          console.log("order")
        }
      }
    );
  });
};



