

const nodemailer = require("nodemailer");

const sendEmail =(to, url, txt) => {
  
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASS_KEY,
      },
    });
     
    

    var mailOptions = {
      from: "kumariujwalas@gmail.com",
      to: to,
      subject: "deliveryboy app",
      html: `
          <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
          <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the Delivery Boy app.</h2>
          <div>${url}</div>
          </div>
      `
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if(err) return err;
        return data
    })
  };


module.exports = sendEmail;
