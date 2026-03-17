const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

name:String,

email:String,

role:{
type:String,
enum:["citizen","worker","admin"]
}

});

module.exports = mongoose.model("User",UserSchema);