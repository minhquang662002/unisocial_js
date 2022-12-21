const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Access token not found" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, id) => {
      if (err)
        return res.status(401).json({ message: "Invalid authentication" });

      req.id = id;
      next();
    });
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
