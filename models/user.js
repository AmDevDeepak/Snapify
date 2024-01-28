const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true, // Ensure usernames are unique
  },
  dp: {
    url: String,
    filename: String,
  },
  bio: {
    type: String,
  },
});

//userSchema.plugin(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose, { usernameField: "username" });


module.exports = mongoose.model("User", userSchema);
