const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Like", likeSchema);
