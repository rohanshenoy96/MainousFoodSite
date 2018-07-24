var mongoose = require("mongoose");
var Schema   = mongoose.Schema;

//Schema
var ItemSchema = new Schema({
    name : {type : String, unique : true },
    image : String,
    rating: Number,
    hot : String,
    total_time : String,
    yields : String,
    desc : String,
    ingredients : String,
    nutrition_info : String,
    steps : String
});


module.exports = mongoose.model('Item', ItemSchema);