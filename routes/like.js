const express = require("express");
const router = express.Router({ mergeParams: true });
const Post = require("../models/post");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

router.post("/", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  // Check if the user has already liked the post
  const userIndex = post.likes.indexOf(req.user._id);

  if (userIndex === -1) {
    post.likes.push(req.user._id);
  } else {
    post.likes.splice(userIndex, 1);
  }

  await post.save();

  // Send JSON response with the updated like count and whether the user liked the post
  res.json({ likeCount: post.likes.length, liked: userIndex === -1 });
});



module.exports = router;