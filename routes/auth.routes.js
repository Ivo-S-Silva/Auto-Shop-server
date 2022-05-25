const router = require("express").Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
const jwt = require("jsonwebtoken");

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

router.get("/loggedin", (req, res) => {
  res.json(req.user);
});

router.post('/signup', (req, res, next) => {
  const { email, password } = req.body;
  // Check if email or password or name are provided as empty string 
  if (email === '' || password === '') {
      res.status(400).json({ message: "Provide email, password and name" });
      return;
  }
  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Provide a valid email address.' });
      return;
  }
  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
      res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
      return;
  }
  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
      .then((foundUser) => {
          // If the user with the same email already exists, we need to stop the promise chain
          if (foundUser) {
              const customError = new Error();
              customError.name = "userExists";
              customError.message = "User already exists.";
              throw customError; //we throw an error to break the promise chain (ie. to avoid going to the next .then() )
          }

          // If email is unique, proceed to hash the password
          const salt = bcrypt.genSaltSync(saltRounds);
          const hashedPassword = bcrypt.hashSync(password, salt);
          // Create the new user in the database
          // We return a pending promise, which allows us to chain another `then` 
          return User.create({ email, password: hashedPassword });
      })
      .then((createdUser) => {
          // Deconstruct the newly created user object to omit the password
          // We should never expose passwords publicly
          const { email, _id } = createdUser;
          // Create a new object that doesn't expose the password
          const user = { email, _id };
          // Send a json response containing the user object
          res.status(201).json({ user: user });
      })
      .catch(err => {
          console.log("error creating new user... ", err);
          if(err.name === "userExists"){
              res.status(400).json({ message: err.message });
          } else {
              res.status(500).json({ message: "Internal Server Error: error creating new user" })
          }

      });
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ errorMessage: "Please provide your email." });
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 8) {
    return res.status(400).json({
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  // Search the database for a user with the username submitted in the form
  User.findOne({ email })
    .then((user) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!user) {
        return res.status(400).json({ errorMessage: "Wrong credentials." });
      }

      const passwordCorrect = bcrypt.compareSync(password, user.password);

      console.log(passwordCorrect);

      if (passwordCorrect) {
        const { _id, email } = user;

        const payload = { _id, email };

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        return res.json({ authToken: authToken });
      }
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

router.get("/verify", isAuthenticated, (req, res, next) => {
  console.log(`req.payload`, req.payload);

  res.json(req.payload);
});

module.exports = router;
