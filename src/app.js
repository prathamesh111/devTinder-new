const express = require("express");
const app = express();

require("./config/database");
const { connectDB } = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

const {
  validateSignUpData,
  valdiateSignIndata,
} = require("./utils/validation");

// middleware for parsing JSON request bodies. It allows the server to accept and process incoming requests that contain JSON data, which is commonly used in RESTful APIs for sending and receiving data between the client and server.

// posting userdata to the database using the User model. The data is received in the request body and is used to create a new instance of the User model. This instance is then saved to the database using the save() method. If the save operation is successful, a success message is sent back to the client with a status code of 201 (Created). If there is an error during the save operation, an error message is sent back to the client with a status code of 500 (Internal Server Error).
app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    valdiateSignIndata(req);

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new Error("Invalid credentials");
    }

    // sending token back using jsonwebtoken
    var token = await jwt.sign({ _id: user._id }, "Backend@2026", {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
    });
    res.send("Login Successful");
  } catch (err) {
    res.status(500).send("Error logging in: " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    console.log("The logged in user is => " + req.user.firstName);
    res.send(req.user);
  } catch (err) {
    res.status(500).send("Error getting profile information: " + err.message);
  }
});

app.post("/sendconnectionrequest", userAuth, (req, res, next) => {
  try {
    const user = req.user;
    res.send(user.firstName + "sent connection request to you");
  } catch (err) {
    res.status(500).send("Error sending connection request: " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  });
