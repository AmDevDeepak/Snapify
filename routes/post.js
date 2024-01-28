const express = require('express');
const router = express.Router({mergeParams: true});
const Post = require("../models/post");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const multer = require("multer");
const { postStorage } = require("../cloudConfig"); // Import dpStorage for user routes
const upload = multer({ storage: postStorage }); 

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}    
// //Index Route
router.get(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
      const allPosts = await Post.find({}).populate("owner");
      res.render("./posts/index", { allPosts });
  })
);

// New Route
router.get('/new', isLoggedIn, (req, res) => {
    res.render('./posts/new');
})


//Read/Show Route
router.get('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const post = await Post.findById(id).populate('likes').populate({ path: 'comments', populate : {path: 'commenter'} }).populate('owner'); 
    //const comments = await Comment.find({post: post._id}).populate("commenter", "username");
    if (!post) {
        req.flash("error", "Post not found");
        return res.redirect("/posts"); 
    }
    res.render('./posts/show', { post }); 
}));


//Create route
router.post('/', isLoggedIn, upload.single("post[image]"), wrapAsync(async (req, res, next) => {
    if (!req.body.post) {
        throw new ExpressError(400, "Send Valid Data For Post")
    }
    let postUrl = req.file.path;
    let postFilename = req.file.filename;
    const newPost = new Post(req.body.post);
    newPost.owner = req.user._id;
    newPost.image = { postUrl, postFilename };
    await newPost.save();
    req.flash('success', 'Posted Successfully!');
    res.redirect('/posts');
}));


//edit route
router.get('/:id/edit', isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const post = await Post.findById(id);
    res.render('./posts/edit', { post })
}));

// update route
router.put('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let post = await Post.findById(id);
    if (!post.owner.equals(req.user._id)) { // Correct the way you're checking the owner
        req.flash("error", "You don't have permission to edit");
        return res.redirect(`/posts/${id}`);
    }

    const { caption, location } = req.body.post;
    
    // Use { new: true } to return the updated document
    const updatedPost = await Post.findByIdAndUpdate(id, { caption, location }, { new: true });

    req.flash("success", "Updated Successfully!");
    res.redirect(`/posts/${updatedPost._id}`);
}));

// Delete route
router.delete('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let post = await Post.findById(id);

    if (!post.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to delete this post");
        return res.redirect(`/posts/${id}`);
    }

    await Post.findByIdAndDelete(id);
    req.flash("success", "Deleted Successfully!");
    res.redirect('/posts');
}));


module.exports = router;