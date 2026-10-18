import mongoose from "mongoose";

const cached = globalThis.mongooseConnection ?? {
    connection: null,
    promise: null,
};

globalThis.mongooseConnection = cached;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
        return mongoose.connection.asPromise();
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured.");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI)
            .then((connection) => {
                cached.connection = connection;
                return connection;
            })
            .catch((error) => {
                cached.promise = null;
                cached.connection = null;
                throw error;
            });
    }

    return cached.promise;
};

export default connectDB;