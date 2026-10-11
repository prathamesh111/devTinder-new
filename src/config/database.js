const mongoose = require('mongoose');


// connection url from mongodb atlas followed by db name(devTinder)
const connectDB = async () => {
    await mongoose.connect("mongodb+srv://prathamsamudra_db_user:admin@namastenode.nxgzvwx.mongodb.net/devTinder")
}


module.exports = {connectDB};