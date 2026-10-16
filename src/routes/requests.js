const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

requestRouter.post("/sendconnectionrequest", userAuth, (req, res, next) => {
  try {
    const user = req.user;
    res.send(user.firstName + " sent connection request to you");
  } catch (err) {
    res.status(500).send("Error sending connection request: " + err.message);
  }
});

module.exports = requestRouter;