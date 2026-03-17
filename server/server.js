const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const Report = require("./models/Report");
const User = require("./models/User");
const Cleanup = require("./models/Cleanup");

const { loadModel, detectGarbage } = require("./garbageDetector");

const app = express();

app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(express.json());

/* ---------------- REGISTER USER ---------------- */

app.post("/register", async (req,res)=>{

try{

const user = new User({
name:req.body.name,
email:req.body.email,
role:req.body.role
});

await user.save();

res.json({
message:"User registered successfully"
});

}catch(error){

res.status(500).json({error:error.message});

}

});

/* ---------------- MULTER CONFIG ---------------- */

const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, "uploads/");
},
filename: function (req, file, cb) {
cb(null, Date.now() + "-" + file.originalname);
}
});

const upload = multer({ storage: storage });

/* ---------------- MONGODB CONNECTION ---------------- */

mongoose.connect("mongodb://127.0.0.1:27017/garbageDB")
.then(() => {
console.log("MongoDB Connected");
})
.catch((err) => {
console.log("MongoDB Error:", err);
});

/* ---------------- LOAD AI MODEL ---------------- */

loadModel();

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
res.send("Garbage Detection API Working 🚀");
});

/* ---------------- CREATE REPORT ---------------- */

app.post("/report", upload.single("image"), async (req, res) => {

try {

if (!req.file) {
return res.status(400).json({ error: "Image upload failed" });
}

const imagePath = "uploads/" + req.file.filename;

const result = await detectGarbage(imagePath);

const aiVerified = result ? result.detected : false;
const detectedObjects = result ? result.objects : [];

const newReport = new Report({

userId:req.body.userId,

image:req.file.filename,

location:req.body.location,

latitude:Number(req.body.latitude),

longitude:Number(req.body.longitude),

description:req.body.description,

riskLevel:req.body.riskLevel

});

const savedReport = await newReport.save();

res.json({
message: "Report saved successfully!",
reportId: savedReport._id,
aiVerified: aiVerified,
detectedObjects: detectedObjects
});

} catch (error) {

res.status(500).json({
error: "Error processing report"
});

}

});

/* ---------------- GET REPORTS ---------------- */

app.get("/reports", async (req, res) => {

try{

const reports = await Report.find().populate("userId","name");

res.json(reports);

}catch(error){

res.status(500).json({error:error.message});

}

});
/* ---------------- CLEANUP API ---------------- */

app.post("/cleanup/:id", upload.single("image"), async (req, res) => {

try {

const cleanup = new Cleanup({
reportId:req.params.id,
afterImage:req.file.filename
});

await cleanup.save();

await Report.findByIdAndUpdate(
req.params.id,
{status:"Cleaned"}
);

res.json({ message: "Cleanup recorded successfully" });

} catch (error) {

res.status(500).json({ error: error.message });

}

});
/* ---------------- LOGIN USER ---------------- */

app.post("/login", async (req,res)=>{

try{

const user = await User.findOne({email:req.body.email});

if(!user){

return res.json({
success:false,
message:"User not found"
});

}

res.json({
success:true,
user:user
});

}catch(error){

res.status(500).json({error:error.message});

}

});
/* ---------------- START SERVER ---------------- */

app.listen(5000, () => {
console.log("Server started on port 5000");
});