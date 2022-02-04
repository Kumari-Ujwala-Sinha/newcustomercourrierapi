const Users = require('../models/userModel')

const rateidentify = async (req, res, next) => {
    try {
      
        const user = await Users.findOne({_id: req.user.id})
        if(user.role == 0 && !user.businessCustomer) {
            req.userid = "fornormaluser"
            next()
        }else if(user.role == 1 && user.businessCustomer){
            req.userid = req.user.id
            next()
        }else{
            return res.status(400).json({msg: "Wait for your business to verify"})
        }
           

        
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = rateidentify