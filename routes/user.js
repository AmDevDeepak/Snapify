const express = require("express");
const router = express.Router(); 
const User = require('../models/user');
const Post = require('../models/post');
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { dpStorage } = require("../cloudConfig"); // Import dpStorage for user routes
const upload = multer({ storage: dpStorage }); 

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); 
  }
  res.redirect("/login");
};

//Signup form
router.get("/signup", (req, res) => {
  res.render('./users/signup');
});


// profile post route
router.post('/signup', upload.single('dp'), (async (req, res) => {
  try {
    let { name, username, password } = req.body;
    const dpUrl = req.file.path; // Cloudinary URL
    const dpFilename = req.file.filename; // Cloudinary filename

    //console.log(dpUrl, dpFilename);
    // Corrected: use dpUrl and dpFilename to set dp field
    let newUser = new User({ name, username, dp: { url: dpUrl, filename: dpFilename } });
    
    let registeredUser = await User.register(newUser, password);
    //console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Registered");
      res.redirect(`/profile/${registeredUser._id}`);
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/signup');
  }
}));


// Go to profile -- New user
router.get(
  "/profile/:userId", isLoggedIn,
  wrapAsync(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const userPosts = await Post.find({ owner: userId }).populate('owner');

    // Render the user profile page with user data
    res.render("./users/profile", { user, userPosts});
  })
);

// Render edit profile form
router.get('/profile/edit/:userId', isLoggedIn, wrapAsync(async(req, res) => {
  res.render('users/editProfile', { user: req.user, userId: req.user._id });
}));

// // Updating profile route --> only username, name and bio..
router.put(
  "/profile/:userId",
  isLoggedIn,
  upload.single("user[dp]"),
  wrapAsync(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const oldDpFilename = user.dp.filename;
    let profile = await User.findByIdAndUpdate(userId, { ...req.body.user }, { new: true });

    if (typeof req.file !== 'undefined') {
          let dpUrl = req.file.path; // Cloudinary URL
          let dpFilename = req.file.filename; // Cloudinary filename
      //console.log(dpUrl, dpFilename);
      if (oldDpFilename) {
        await cloudinary.uploader.destroy(oldDpFilename);
      }

      profile.dp.url = dpUrl;
      profile.dp.filename = dpFilename;
      await profile.save();
    }
    req.flash("success", "Updated Successfully!");
    res.redirect(`/profile/${userId}`);
  })
);

//Login form
router.get("/login", (req, res) => {
  res.render('./users/login');
});

// login post route
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    if (req.isAuthenticated()) {
      req.flash("success", "Logged In");
      res.redirect("/posts");
    } else {
      req.flash("error", "Invalid username or password");
      res.redirect("/login");
    }
  }
);

//Logout user
router.get('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Logged Out');
    res.redirect('/login');
  })
});

// Route to display all users or search users
router.get('/users', isLoggedIn, wrapAsync((async (req, res) => {
    try {
        let query = req.query.name || ''; // Get the name query from the URL
        const users = await User.find({ name: { $regex: query, $options: 'i' } }); // Case-insensitive search
        res.render('users/users', { users, query });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})));

module.exports = router;
