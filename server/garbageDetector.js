const cocoSsd = require("@tensorflow-models/coco-ssd");
const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const jpeg = require("jpeg-js");

let model;

/* LOAD MODEL */

async function loadModel(){
    model = await cocoSsd.load();
    console.log("AI Model Loaded");
}

/* DETECT GARBAGE */

async function detectGarbage(imagePath){

try{

const imageBuffer = fs.readFileSync(imagePath);

const decoded = jpeg.decode(imageBuffer, true);

const tensor = tf.tensor3d(decoded.data,[decoded.height,decoded.width,4]);

const predictions = await model.detect(tensor);

const garbageObjects = ["bottle","cup","bag","banana","food"];

let detectedObjects=[];

predictions.forEach(p=>{
if(garbageObjects.includes(p.class)){
detectedObjects.push(p.class);
}
});

return {
detected: detectedObjects.length>0,
objects: detectedObjects
};

}catch(error){

console.log("AI detection error:",error);

return {
detected:false,
objects:[]
};

}

}

/* EXPORT FUNCTIONS */

module.exports = { loadModel, detectGarbage };
