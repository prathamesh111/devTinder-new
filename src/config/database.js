const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoDBURI = process.env.MONGODB_URI;
    if (!mongoDBURI) {
        throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(mongoDBURI);
}

module.exports = {connectDB};
