const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
var validator = require("validator");
const jwt = require("jsonwebtoken");

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
      required: true,
    },
    email: {
      type: String,
      required: true,
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
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password too weak");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 99,
    },
    gender: {
      type: String,
      emums: {
        values: ["male", "female", "others"],
        message: `{VALUE} is not a valid gender type`
      }
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn-icons-png.flaticon.com/512/1053/1053244.png",
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
      default: ["js"],
    },
  },
  {
    timestamps: true,
  },
);

// arrow function not allowed for schema functions

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "Backend@2026", {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordMatched = await bcrypt.compare(passwordByUser, passwordHash);
  return isPasswordMatched;
};

// model name starts with capital  letter

module.exports = mongoose.model("User", userSchema);
