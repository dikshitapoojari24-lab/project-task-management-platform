const dotenv = require("dotenv");
const app = require("../src/app");
const connectDB = require("../src/config/db");

dotenv.config();

let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  return app(req, res);
};

module.exports = handler; 