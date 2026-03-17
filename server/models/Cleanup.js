const mongoose = require("mongoose");

const CleanupSchema = new mongoose.Schema({

reportId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Report"
},

afterImage:String,

cleanedAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Cleanup",CleanupSchema);