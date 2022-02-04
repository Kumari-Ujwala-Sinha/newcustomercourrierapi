const Otp = require('../models/otpModel')


const otpverify =async (req, res, next) => {
    const data =await Otp.findOne({code:req.body.otpcode})
    try {
       
        if(data){
            let currentTime=new Date().getTime()
            let diff = data.expireIn-currentTime
            
            if(diff < 0){
                return res.status(400).json({msg:"otp expired"})
            }else{
                req.activation_token=data.activation_tokenv
                req.otpverify_id=data._id
                req.emailv=data.emailv
                next()
            }
        }else{
            return res.status(400).json({msg:"otp expired"})
        }
       
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = otpverify