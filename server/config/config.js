const databaseName = process.env.MONGO_DB_NAME || "Library";
const SECRET_TOKEN = 'WEBAPPLICATIONDEVELOPMENT'

const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT || "3000",
    jwtSecret: process.env.JWT_SECRET,
    secretToken: SECRET_TOKEN,
    mongoDbName: databaseName,
    mongoUri:
        process.env.MONGO_URI ||
        `mongodb://${process.env.IP || "127.0.0.1"}:${
            process.env.MONGO_PORT || "27017"
        }/${databaseName}`,
};


export default config;
