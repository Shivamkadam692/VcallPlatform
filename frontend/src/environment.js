const server = {
    dev: process.env.REACT_APP_SERVER_DEV || "http://localhost:8000",
    prod: process.env.REACT_APP_SERVER_PROD || "https://vcall-backend.onrender.com"
};

export const appName = process.env.REACT_APP_APP_NAME || "Meow Video Call";

export default server;