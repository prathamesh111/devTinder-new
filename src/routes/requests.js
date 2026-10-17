const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user")

const { userAuth } = require("../middlewares/auth");
const connectionRequests = require("../models/connectionRequests");

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res, next) => {
    try {
      const status = req.params.status;
      const toUserId = req.params.userId;
      const fromUserId = req.user._id;

      const allowedStaus = ["ignored", "interested"];
      if (!allowedStaus.includes(status)) {
        return res.status(400).json({
          message: "Invalid Status type" + status,
        });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      const existingConnectionRequest = await connectionRequests.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest){
        return res.status(400).json({
          message: "Cannot send connection request (Existing/duplicate)",
        });
      }

      

      const connectionRequest = new connectionRequests({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: "Connection Request sent Successfully",
        data,
      });
    } catch (err) {
      res.status(500).send("Error sending connection request: " + err.message);
    }
  },
);


requestRouter.post("/request/review/:status/:requestId", userAuth, async(req, res, next) => {
  try{
    const loggedInUser = req.user;
    const {status, requestId} = req.params;

    // valdiate user inputs status and reviewId

    const allowedStatus = ["accepted", "rejected"];
    if(!allowedStatus.includes(status)){
      return res.status(400).json({
        message: "Status not allowed!"
      })
    }

    const connectionRequest = await connectionRequests.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status : "interested"
    });

    console.log("loggedin user id" + loggedInUser._id);
    console.log("_id " + requestId);

    if(!connectionRequest){
      return res.status(400).json({
        message: "connection request not found"
      })
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();

    res.json({
      message: `you ${status} request`,
      data : data
    })





  }catch(err){
    res.status(500).send("Error " + err.message);
  }
});

module.exports = requestRouter;
