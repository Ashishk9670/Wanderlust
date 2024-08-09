if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listings.js");
const review = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const dbURL = process.env.ATLAS_URL;
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
}
const path = require("path");
const methodOverride = require("method-override");
const { count } = require("console");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: "mysupersecretcode",
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", () => {
  console.log("error in mongo session store", err);
});

const sessionOptions = {
  store,
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialised: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req, res) => {
  res.send("working");
});

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "ashish@b.com",
//     username: "augustus",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

app.listen(8080, () => {
  console.log("app is listening on port 8080");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", review);
app.use("/", userRouter);

// app.get("/getListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "Woodsland",
//     description: "Into the woods",
//     price: 12000,
//     location: "Gorakhpur",
//     country: "India",
//   });
//   sampleListing.save();
//   console.log("sample test is working");
//   res.send("Working");
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.render("error.ejs", { message });
  res.status(statusCode).render("error.ejs", { message });
});
