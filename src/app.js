const express = require('express');

const {adminAuth, userAuth} = require("./middlewares/auth");

const app = express();

app.use("/test", (req, res, next) => {
    res.send("Hello from server");
    // console.log("Hello from server");
});

// app.use("/hello", (req, res, next) => {
//     res.send("Hello, World!");
// });
// app.use("/hello/1", (req, res, next) => {
//     res.send("Hello, World! (Route 1)");
// });

// app.get("/hello/*", (req, res) => {
//   res.send("Matches /hello/abc, /hello/abc/123, etc.");
// });

// app.get("/user/:id+", (req, res) => {
//   res.send("Matches /user/1 or /user/1/2");
// });

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
app.listen(3000, () => {
    console.log('Server is running on port 3000');
})