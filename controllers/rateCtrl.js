const Rates = require("../models/rateModel");

const rateCtrl = {
  
  createRate: async (req, res) => {
    try {
      const {
        devider,
        ratelesshalf,
        rateuptoone,
        rateuptotwo,
        rateuptofive,
        userId
      } = req.body;
      const newRate = new Rates({
        devider,
        ratelesshalf,
        rateuptoone,
        userId,
        rateuptotwo,
        rateuptofive
      });
      await newRate.save();
      res.json({ msg: "Saved your Rate" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  allrate: async (req, res) => {
    try {
        const rates = await Rates.find();
        res.json(rates);
 
     
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  calculaterate: async (req, res) => {
    try {
        const {
            height,length,width
          } = req.body;
          const value=height*length*width
        const rate = await Rates.findOne({"userId":req.userid})
        if(!rate){
          return res.json("You are a business customer and not assigned any rate")
        }
        const devidedvalue=value/rate.devider
        if(devidedvalue <=500){
            //console.log(rate.ratelesshalf)
            return res.json(rate.ratelesshalf);
        }
        else if(devidedvalue > 500 && devidedvalue <=1000){
            //console.log(rate.rateuptoone)
            return res.json(rate.rateuptoone);
        }
        else if(devidedvalue > 1000 && devidedvalue <=2500){
           // console.log(rate.rateuptotwo)
            return res.json(rate.rateuptotwo);
        }
        else {
            //console.log(rate.rateuptofive)
            return res.json(rate.rateuptofive);
        }
      
 
     
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }


};

module.exports = rateCtrl;
