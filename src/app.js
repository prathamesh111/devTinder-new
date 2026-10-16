const express = require("express");
const app = express();

require("./config/database");
const { connectDB } = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


app.use(express.json());
app.use(cookieParser())

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
    var token = jwt.sign({ _id: user._id }, "Backend@2026");

    res.cookie('token', token);   
    res.send("Login Successful");
  } catch (err) {
    res.status(500).send("Error logging in: " + err.message);
  }
});


app.get("/profile", async (req, res) => {
  try{
    const userToken = req.cookies.token; 
    const decoded = await jwt.verify(userToken, 'Backend@2026');
    const {_id} = decoded;
    const user = await User.findById(_id);
    if(!user){
      throw new Error("User does not exist in DB")
    }
    console.log("The logged in user is => " + user.firstName);
    res.send(user);

  }catch(err){
    res.status(500).send("Error getting profile information: " + err.message);
  }
});

// GET user by email
app.get("/user", async (req, res) => {
  const email = req.body.email;
  try {
    const users = await User.find({ email: email });
    if (users.length == 0) {
      res.status(404).send("User not found");
    }
    res.send(users);
  } catch (err) {
    res.status(500).send("Error finding users: " + err.message);
  }
});

// feed API - GET- FEED

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send("Somehing went wrong");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Somehing went wrong");
  }
});

//updating user data
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    //api level validtion to restrict fields
    const allowedUpdates = [
      "name",
      "age",
      "gender",
      "skills",
      "photoUrl",
      "password",
    ];
    const isUpdateAllowed = Object.keys(req.body).every((k) => {
      return allowedUpdates.includes(k);
    });
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    if (req.body.skills.length >= 5) {
      throw new Error("Cannot enter more than 4 skills");
    }
    const user = await User.findByIdAndUpdate(userId, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(user);
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("Update failed: " + err.message);
  }
});

//  update users Email using emailId payload

app.patch("/userByEmail", async (req, res) => {
  const { email, newEmailId } = req.body;
  if (!email || !newEmailId) {
    return res
      .status(400)
      .send("Both email (current email) and newEmailId are required");
  }

  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { email: newEmailId },
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User email updated successfully");
  } catch (err) {
    res.status(400).send("Error updating user email: " + err.message);
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
