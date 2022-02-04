const mongoose = require('mongoose')

const customerfeedSchema = mongoose.Schema({
    deliveryitem:{
        type:String,
          
    },
    customer:{
     type:String,
     required:true
    },
    phone:{
        type:String
    },
    name:{
        type:String
    },

    message:{
        type:String,
    }
   
},{
    timestamps:true
})

module.exports = mongoose.model("Customerfeed", customerfeedSchema)