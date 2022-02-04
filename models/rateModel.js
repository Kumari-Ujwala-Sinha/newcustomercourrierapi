const mongoose = require('mongoose')


const rateSchema = new mongoose.Schema({
    
    
    devider: {
        type: Number,
   
    },
    ratelesshalf: {
        type: Number,
   
    },
    rateuptoone: {
        type: Number,
   
    },
    rateuptotwo: {
        type: Number,
   
    },
    rateuptofive: {
        type: Number,
   
    },
    userId:{
        type:String
    }
    
}, {
    timestamps: true
})

module.exports = mongoose.model("Rates", rateSchema)