// const express = require("express");
// const routerVonage = express.Router();
// const bodyParser = require("body-parser");
// const { Vonage } = require("@vonage/server-sdk");
// const fs = require('fs');
// require('dotenv').config();

// routerVonage.use(bodyParser.json());

// const vonage = new Vonage({
//   applicationId: "53eb77be-d25a-434c-8d72-d83734ba50ab",
//   privateKey: fs.readFileSync(process.env.VONAGE_PRIVATE_KEY_PATH)
// });

// routerVonage.get("/answer", (req, res) => {
//   const ncco = [
//     {
//       action: "talk",
//       voiceName: "Jennifer",
//       text: "Hello, thank you for calling. This is the Jennifer voice from Vonage.",
//     },
//   ];
//   res.json(ncco);
// });

// routerVonage.post("/event", (req, res) => {
//   console.log("Vonage Event:", req.body);
//   res.status(204).end();
// });

// routerVonage.post('/make-call', async (req, res) => {
//   try {
//     const response = await vonage.voice.createOutboundCall({
//       to: [{ type: 'phone', number: +8574786219 }],
//       from: { type: 'phone', number: +12345678901 },
//       answer_url: [`${process.env.PUBLIC_URL}/answer`]
//     });
//     res.json({ success: true, response });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.toString() });
//   }
// });

// module.exports = routerVonage;
