if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const likeRouter = require("./routes/like");
const userRouter = require('./routes/user');
const multer = require("multer");
//const upload = multer({ dest: "uploads/" });

const dbUrl = process.env.DB_URL;
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log('Error in mongo session store', err);
})
// Session and Flash middleware should be placed before route definitions
app.use(
  session({
    store: store,
    resave: false,
    saveUninitialized: true,
    secret: process.env.SECRET,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use(flash());
// Passport middleware should be initialized after session middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Custom middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// Routes should be defined after middleware
app.use("/posts", postRouter);
app.use("/posts/:id/comments", commentRouter);
app.use("/posts/:id/likes", likeRouter);
app.use("/", userRouter);

// Demo User
// app.get("/demousr", async (req, res) => {
//   let fakeUser = new User({
//     name: "fakeUser",
//     username: "@fake2",
//   });
//   let registeredUser = await User.register(fakeUser, "hello");
//   res.send(registeredUser);
// });

// Root route
app.get("/", (req, res) => {
  res.send("Am root");
});

// Page not found
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error route
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.render("posts/error", { statusCode, message });
});

main()
  .then(() => {
    console.log("Connected To DataBase.");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(8080, () => {
  console.log("App Listening To Port.");
});
