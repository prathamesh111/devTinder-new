const express = require('express');
require("./config/database");
const { connectDB } = require("./config/database");
const User = require("./models/user");
const app = express();
app.use(express.json());


app.post("/signup", async (req, res) => {
    // creating a new isntance of the User model from the data received in the request body. This instance represents a new user that we want to save to the database.
    const user = new User(req.body);
    
    // modelname.save return a promise so we can use await to wait for the save operation to complete before sending a response back to the client. This ensures that the user is saved to the database before we send a success message.

    try {
        await user.save();
        res.status(201).send("User created successfully");
    } catch (err) {
        res.status(500).send("Error creating user: " + err.message);
    }


});



connectDB().then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    })
}).catch((err) => {
    console.log("Database connection failed", err);
})

