const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionRequests = require("../models/connectionRequests");
const userRouter = express.Router();

userRouter.get("/users/requests/received", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await connectionRequests
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "age",
        "photoUrl",
        "gender",
        "skills",
      ]);

    res.json({
      messsage: "fetched connections",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).json({
      message: `some error occured + ${err.message}`,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await connectionRequests.find({
      status: "accepted",
      $or : [{toUserId: loggedInUser._id}, {fromUserId: loggedInUser._id}]
    }).populate("fromUserId", [
        "firstName",
        "lastName",
        "age",
        "photoUrl",
        "gender",
        "skills",
      ]).populate("toUserId", [
        "firstName",
        "lastName",
        "age",
        "photoUrl",
        "gender",
        "skills",
      ])

    if (!connectionRequest) {
      throw new Error("You dont have any connections");
    }

    // console.log(connectionRequest)

    const data = connectionRequest.map((row) => {
      if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
        return row.toUserId;
      }
      return row.fromUserId;
    })


    console.log(data)

    res.json({
      message: "connections fetched",
      data: data
    });
  } catch (err) {
    res.status(400).json({
      message: `some error occured + ${err.message}`,
    });
  }
});

module.exports = userRouter;
