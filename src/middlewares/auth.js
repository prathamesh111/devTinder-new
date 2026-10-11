 const adminAuth = (req, res, next) => {
    console.log("Admin middleware executed");
    const token = "xyz";
    const isAdminAuthorized = token === "xyz";
    if (!isAdminAuthorized) {
        res.status(401).send("Unauthorized");
    }else{
        next();
    }
}

 const userAuth = (req, res, next) => {
    console.log("User middleware executed");
    const token = "xyz";
    const isUserAuthorized = token === "xyz";
    if (!isUserAuthorized) {
        res.status(401).send("Unauthorized");
    }else{
        next();
    }
}


module.exports = { adminAuth, userAuth };