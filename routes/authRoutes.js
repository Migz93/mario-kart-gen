const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const AppSettings = require('../models/AppSettings'); // Import AppSettings model to check for registration allowance
const router = express.Router();

router.get('/auth/register', async (req, res) => {
  try {
    // Check if new signups are allowed before rendering the registration page
    const settings = await AppSettings.findOne({});
    if (settings && !settings.allowNewSignups) {
      // If new signups are not allowed, redirect to the login page with a message
      return res.redirect('/auth/login?error=Registrations are currently closed.');
    }
    res.render('register');
  } catch (error) {
    console.error('Error fetching app settings:', error);
    res.status(500).send('Error loading the registration page.');
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    // Before proceeding with registration, check if new signups are allowed
    const settings = await AppSettings.findOne({});
    if (settings && !settings.allowNewSignups) {
      // If new signups are not allowed, send an appropriate response
      return res.status(403).send('New registrations are currently not allowed.');
    }

    const { username, password } = req.body;
    // User model will automatically hash the password using bcrypt
    await User.create({ username, password });
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send(error.message);
  }
});

router.get('/auth/login', async (req, res) => {
  try {
    // Fetch the current settings to determine if new signups are allowed
    const settings = await AppSettings.findOne({});
    res.render('login', { allowNewSignups: settings ? settings.allowNewSignups : false });
  } catch (error) {
    console.error('Error fetching app settings for login page:', error);
    res.status(500).send('Error loading the login page.');
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      return res.redirect('/');
    } else {
      return res.status(400).send('Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send(error.message);
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;