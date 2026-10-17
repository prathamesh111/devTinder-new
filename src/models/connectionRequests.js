const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      requried: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      requried: true,
    },
    status: {
      type: String,
      requried: true,
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

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
