const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("../models/user");

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: User
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is not a valid status`,
      },
    },
  },
  {
    timestamps: true,
  },
);


// middleware to run before every save
connectionRequestSchema.pre("save", function() {
    const currentReq = this;
    if(currentReq.fromUserId.equals(currentReq.toUserId)){
        throw new Error("You cannot send request to yourself")
    }
});

connectionRequestSchema.index({fromUserId: 1, toUserId: 1});    

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
