// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require('./routes/adminRoutes'); // Added adminRoutes
const Setup = require('./models/Setup'); // Import Setup model for querying the latest setup
const AppSettings = require('./models/AppSettings'); // Import AppSettings model

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
    ensureDefaultSettings();
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Admin Routes - Added for admin interface
app.use(adminRoutes);

// Root path response
app.get("/", async (req, res) => {
  try {
    // Fetch the last 10 setups from the database, including the current week's setup
    const setups = await Setup.find().sort({ week: -1 }).limit(10);
    if (!setups.length) {
      console.log("No setups found for the current and previous weeks.");
      return res.render("index", { setups: null });
    }
    console.log("Setups found, rendering index with setups.");
    res.render("index", { setups });
  } catch (err) {
    console.error(`Error fetching the latest setups: ${err.message}`, err.stack);
    res.status(500).send("Error loading the homepage");
  }
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Ensure default settings exist in the database
function ensureDefaultSettings() {
  AppSettings.findOne({}).then(settings => {
    if (!settings) {
      const newSettings = new AppSettings({ allowNewSignups: true });
      newSettings.save().then(savedSettings => {
        console.log('Default app settings created:', savedSettings);
      }).catch(err => {
        console.error(`Error creating default app settings: ${err.message}`, err.stack);
      });
    }
  }).catch(err => {
    console.error(`Error checking for default app settings: ${err.message}`, err.stack);
  });
}