
// test-cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dcdgjge4h",   
  api_key: "945649279566146",
  api_secret: "gXiAi4xjSZWBaxq",
});

cloudinary.uploader.upload("../uploads/test1.jpg", {
  folder: "astrologer_profiles",
})
.then(result => console.log("✅ Upload Success:", result.secure_url))
.catch(error => console.error("❌ Upload Failed:", error));

