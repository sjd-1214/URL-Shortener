const mongoose = require("mongoose");

const urlSchema = mongoose.Schema({
  original_url:{
    type:String
  },
  short_url:{
    type:Number
  }
})

let URL = mongoose.model("URL",urlSchema);
module.exports = URL;