const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
require("./config/database");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
var cors = require('cors')


app.use(cors({
   origin: 'http://localhost:5173',
   credentials: true
}))
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  });
