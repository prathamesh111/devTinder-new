const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    console.log("The logged in user is => " + req.user.firstName);
    res.send(req.user);
  } catch (err) {
    res.status(500).send("Error getting profile information: " + err.message);
  }
});


module.exports = profileRouter