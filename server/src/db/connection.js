const mongoose = require('mongoose');
const { DBName } = require('../constants');
require('dotenv').config();

const connectToDatabase = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DBName}`);
        console.log('Database connected successfully');
    } catch (error) {
        console.error("Database Connection Error", error);
        process.exit(1);
    }
};

module.exports = connectToDatabase;
