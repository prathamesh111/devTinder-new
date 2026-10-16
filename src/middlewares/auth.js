var jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // read the token
    const { token } = req.cookies;
    //validate the token

    const decoded = await jwt.verify(token, "Backend@2026");
    const { _id } = decoded;

    // find the user in Database
    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User not found");
    }

    // pass execution to next callback function
    req.user = user;
    next();
  } catch (err) {
    res.status(500).send("ERROR : " + err.message);
  }
};

module.exports = { userAuth };
