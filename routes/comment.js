const express = require("express");
const router = express.Router({mergeParams: true});
const Post = require("../models/post");
const Comment = require("../models/comment");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

// Comment post route
router.post('/', isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let post = await Post.findById(req.params.id);
    let newComment = new Comment(req.body.comment);
    newComment.commenter = req.user._id;
    //console.log(newComment);

    post.comments.push(newComment);

    await newComment.save();
    await post.save();
    req.flash("success", "Comment Added");
    res.redirect(`/posts/${id}`);
}));


// Comment delete route 
router.delete('/:commentId', isLoggedIn, wrapAsync(async (req, res) => {
    let { id, commentId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash("success", "Comment Deleted");
    res.redirect(`/posts/${id}`);
}));

module.exports = router;