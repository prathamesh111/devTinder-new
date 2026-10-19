const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionRequests = require("../models/connectionRequests");
const User = require("../models/user");
const userRouter = express.Router();

const safeFields = [
        "firstName",
        "lastName",
        "age",
        "photoUrl",
        "gender",
        "skills",
      ]

userRouter.get("/users/requests/received", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await connectionRequests
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", safeFields);

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
    }).populate("fromUserId", safeFields).populate("toUserId", safeFields)

    if (!connectionRequest) {
      throw new Error("You dont have any connections");
    }

    const data = connectionRequest.map((row) => {
      if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
        return row.toUserId;
      }
      return row.fromUserId;
    })


    res.json({
      message: "connections fetched",
      data: data
    });
  } catch (err) {
    res.status(400).json({
      message: `Some error occured + ${err.message}`,
    });
  }
});

userRouter.get("/feed", userAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const connectionReq = await connectionRequests.find({
      $or: [{fromUserId: loggedInUser._id}, {toUserId: loggedInUser._id}]
    }).select("fromUserId toUserId")

    const hiddenUsersFromFeed = new Set();
    connectionReq.forEach((item) => {
      hiddenUsersFromFeed.add(item.fromUserId.toString());
      hiddenUsersFromFeed.add(item.toUserId.toString());
    })

    console.log(hiddenUsersFromFeed);

    const usersList = await User.find({
      $and : [
        {_id: {$nin: Array.from(hiddenUsersFromFeed)}},
        {_id: {$ne : loggedInUser._id}}
      ]
    })
 

    res.json({
      message: "Feeds fetched",
      data: usersList
    });
  } catch (err) {
    res.status(400).json({
      message: `Some error occured while fetching feed + ${err.message}`,
    });
  }
});



module.exports = userRouter;
