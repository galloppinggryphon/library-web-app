import mongoose from "mongoose";
import config from "./config/config.js";

export const connectDB = async() => {
    try {
        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            // useCreateIndex: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to the database!");
    }catch (error) {
        console.log("unable to connect to database: ${config.mongoUri}");
    }
};