const express = require("express");
const profileRouter = express.Router();
const {validateProfileData} = require("../utils/validation")
const { userAuth } = require("../middlewares/auth");
const bcrypt = require('bcrypt');
const {isValidPassword} = require("../utils/validation")

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    console.log("The logged in user is => " + req.user.firstName);
    res.send(req.user);
  } catch (err) {
    res.status(500).send("Error getting profile information: " + err.message);
  }
});

profileRouter.get("/profile/view",userAuth, async (req, res, next) => {
  try{
    const user  = req.user;
    res.send(user);
  }catch(err){  
    res.status(400).send("Error" + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async(req, res, next) => {
    try{
      if(!validateProfileData(req)){
        throw new Error("Requested fields cant be edited");
      }

      const loggedInUser = req.user;
      // Object.keys((req.body)) 
      Object.keys(req.body).forEach((key) => {
        loggedInUser[key] = req.body[key];
      });

      await loggedInUser.save();
      res.json({
        messsage: "Profile edited successfully",
        data: loggedInUser
      })

    }catch(err) {
      res.status(500).send("Error " + err.message);
    }
}); 


profileRouter.patch("/profile/password", userAuth, async(req, res, next) => {
  try {
    const existingPassword = req.body.existingPassword;

    const isPasswordMatched = await req.user.validatePassword(existingPassword);
    if(!isPasswordMatched) {
      throw new Error("Old password didn't match")
    }else if(!isValidPassword(req)){
      throw new Error("Password is too weak !")
    }

    req.user.password =  await bcrypt.hash(req.body.password, 10);
    await req.user.save();
    res.send("password updated");
  } catch (err) {
    res.status(500).send("Error " + err.message);
  }
});


module.exports = profileRouter