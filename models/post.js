const mongoose = require("mongoose");
const Comment = require('./comment');
const User = require('./user');
const Like = require('./like');
const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  image: {
    postUrl: String,
    postFilename: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

postSchema.post('findOneAndDelete', async (post) => {
  if (post) {
    await Comment.deleteMany({ _id: { $in: post.comments } });
  }
});

module.exports = mongoose.model("Post", postSchema);

