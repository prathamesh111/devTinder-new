const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

const {
  validateSignUpData,
  valdiateSignIndata,
} = require("../utils/validation");

// posting userdata to the database using the User model. The data is received in the request body and is used to create a new instance of the User model. This instance is then saved to the database using the save() method. If the save operation is successful, a success message is sent back to the client with a status code of 201 (Created). If there is an error during the save operation, an error message is sent back to the client with a status code of 500 (Internal Server Error).
authRouter.post("/signup", async (req, res) => {
  // creating a new isntance of the User model from the data received in the request body. This instance represents a new user that we want to save to the database.

  // modelname.save return a promise so we can use await to wait for the save operation to complete before sending a response back to the client. This ensures that the user is saved to the database before we send a success message.
  try {
    // custom validator function
    validateSignUpData(req);

    //creating encrypted password
    const { password, firstName, lastName, email } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    await user.save();
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(500).send("Error creating user: " + err.message);
  }
});

// login api
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    valdiateSignIndata(req);

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordMatched = await user.validatePassword(password);
    if (!isPasswordMatched) {
      throw new Error("Invalid credentials");
    }

    // sending token back using jsonwebtoken
    var token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
    });
    res.send(user);
  } catch (err) {
    res.status(500).send("Error logging in: " + err.message);
  }
});

authRouter.post("/logout", async (req, res, next) => {
   res.clearCookie("token");

    res.send("Logged out");
});

module.exports =  authRouter;
