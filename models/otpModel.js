const mongoose = require('mongoose')


const otpSchema = new mongoose.Schema({
    
    emailv: {
        type: String,
        unique: true
    },
    code: {
        type: String,
        unique: true
    },
    expireIn: {
        type: Number,
   
    },
    activation_tokenv : {
        type: String,
    
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' },
      }
}, {
    timestamps: true
})

module.exports = mongoose.model("Otp", otpSchema)