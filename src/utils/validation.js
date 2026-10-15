var validator = require('validator');

const validateSignUpData  = (req) => {
    const {firstName, lastName, email, password} = req.body;    
    if(!firstName || !lastName){
        throw new Error("Name is not valid");
    }else if(!validator.isEmail(email)){
        throw new Error("Email is invalid")
    }else if(!validator.isStrongPassword(password)){
        throw new Error("Password is too weak !")
    }
}

const valdiateSignIndata = (req) => {
    const {email} = req.body;
    if(!validator.isEmail(email)){
        throw new Error("You entered invalid Email");
    }
}
module.exports = {validateSignUpData, valdiateSignIndata}