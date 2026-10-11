const express = require('express');

const {adminAuth, userAuth} = require("./middlewares/auth");

const app = express();

app.use("/test", (req, res, next) => {
    res.send("Hello from server");
    // console.log("Hello from server");
});


app.get("/product/:id", (req, res) => {
  res.send("Matches /product or /product/42");
});

app.get("/users", (req, res, next) => {
    console.log(req.query);
    res.send({ name: "John", age: 30 });
});

app.post("/users", (req, res, next) => {
    res.send({ message: "User created" });
});


// nesting and grouping with callback functions
app.get("/testing", (req, res, next) => {
    console.log("first callback");
    next();
}, (req, res, next) => {
    res.send({ message: "Testing route" });
    console.log("Middleware executed");
}, [(req, res, next) => {
    res.send({ message: "Testing route" });
    console.log("Middleware executed");
}],
    (req, res, next) => {
        res.send({ message: "Testing route" });
        console.log("Middleware executed");
    }
);

app.get('/users/:id/:name/:skill/:age', (req, res, next) => {
    console.log(req.params);
    res.send({ message: "User details" });
});



// Handeling Auth middleware for all Admin routes

app.use("/admin", adminAuth);

app.get("/admin/getAllData",(req, res, next) => {
    res.send({ message: "Admin data" });
}); 

app.get("/admin/deleteUser",(req, res, next) => {
    res.send({ message: "deleted user" });
}); 


app.get("/user", userAuth, (req, res, next) => {
    res.send({ message: "User data" });ß    
});



// Error handling

//route handler has 3 params in callback function, but error handling middleware has 4 params in callback function
app.get("/userData", (req, res, next) => {
        throw new Error("Something went wrong");
        res.send({ message: "User data" });
});

// wildcard error handling middleware
app.use("/", (err, req, res, next) => {
    if(err){
        res.status(500).send({ message: err.message });
    }
    
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})