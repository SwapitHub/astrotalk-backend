const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: "6a24a498",       
  apiSecret: "HQ3LabfIpHvzCwaD",
});

module.exports = vonage;
