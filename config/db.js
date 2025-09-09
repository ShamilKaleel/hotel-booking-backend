const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URLL)
  .then(() => {
    console.log("Connection to database was successful");
  })
  .catch((error) => {
    console.log("Oops! Failed to connect with database");
    console.log(error);
  });
