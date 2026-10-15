const mongoose = require("mongoose");
const { Schema } = mongoose;
var validator = require("validator");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      requried: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email format");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value){
        if(!validator.isStrongPassword(value)){
          throw new Error("Password too weak");
        }
      }
    },
    age: {
      type: Number,
      min: 18,
      max: 99,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value.toLowerCase())) {
          throw new Error("Gender must be either Male, Female, or Other");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://www.google.com/imgres?q=profile%20id%20pic&imgurl=https%3A%2F%2Fwww.pngitem.com%2Fpimgs%2Fm%2F22-224287_computer-icons-user-profile-avatar-caller-id-icon.png&imgrefurl=https%3A%2F%2Fwww.pngitem.com%2Fmiddle%2FixJmih_computer-icons-user-profile-avatar-caller-id-icon%2F&docid=5vtvDry4nRypUM&tbnid=8obT-MCtKHPIoM&vet=12ahUKEwjNr7jb5LuXAxUlkuEIHT5tOIEQnPAOegUI-wEQAA..i&w=860&h=901&hcb=2&ved=2ahUKEwjNr7jb5LuXAxUlkuEIHT5tOIEQnPAOegUI-wEQAA",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL format");
        }
      },
    },
    about: {
      type: String,
      default: "Hey there! I am using devTinder",
      trim: true,
    },
    skills: {
      type: [String],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// model name starts with capital  letter

module.exports = mongoose.model("User", userSchema);
