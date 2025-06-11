// utils/commonToken.js

const COMMON_API_TOKEN = process.env.COMMON_API_TOKEN;

const verifyCommonToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${COMMON_API_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized: Invalid or missing common token" });
  }

  next();
};

module.exports = { verifyCommonToken };
