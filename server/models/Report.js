const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

image:String,

location:String,

latitude:Number,

longitude:Number,

description:String,

riskLevel:String,

status:{
type:String,
default:"Pending"
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Report",ReportSchema);