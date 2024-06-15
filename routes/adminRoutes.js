const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const fs = require('fs');
const path = require('path');
const { generateWeeklySetup } = require('../utils/configGenerator'); // Ensure this path is correct
const { incrementSelectionFrequency } = require('../utils/selectionFrequencyTracker'); // Import the incrementSelectionFrequency function
const AppSettings = require('../models/AppSettings'); // Assuming AppSettings model exists for application-wide settings
const router = express.Router();

// Function to load and shuffle options from JSON files
function loadOptions(fileName) {
  try {
    const filePath = path.join(__dirname, '..', 'data', fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const options = JSON.parse(fileContent);
    console.log(`Loaded options from ${fileName}.`);
    let enabledOptions = Object.keys(options).filter(key => options[key].Enable).map(key => key);
    // Shuffle the enabled options
    for (let i = enabledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [enabledOptions[i], enabledOptions[j]] = [enabledOptions[j], enabledOptions[i]]; // ES6 destructuring swap
    }
    return enabledOptions;
  } catch (error) {
    console.error(`Error loading options from ${fileName}: ${error.message}`, error.stack);
    throw error;
  }
}

// GET route for the admin setup generation page
router.get('/admin/generate-setup', isAuthenticated, (req, res) => {
  try {
    const cars = loadOptions('cars.json');
    const characters = loadOptions('characters.json');
    const gliders = loadOptions('gliders.json');
    const wheels = loadOptions('wheels.json');
    const tracks = loadOptions('tracks.json');

    res.render('admin/generate-setup', { cars, characters, gliders, wheels, tracks });
    console.log('Rendered admin generate-setup page with loaded and shuffled options.');
  } catch (error) {
    console.error(`Error rendering admin generate-setup page: ${error.message}`, error.stack);
    res.status(500).send('Error loading setup generation page');
  }
});

// POST route to handle the form submission for generating a weekly setup
router.post('/admin/generate-setup', isAuthenticated, async (req, res) => {
  try {
    // Extract the form data from req.body
    const { car, character, glider, wheel, track } = req.body;
    // Call generateWeeklySetup with the form data
    await generateWeeklySetup({ car, character, glider, wheel, track });
    console.log('Weekly setup generated and saved to MongoDB:', { car, character, glider, wheel, track });

    // Increment the selection frequency for each component
    await incrementSelectionFrequency({ car, character, glider, wheel, track });
    console.log('Incremented selection frequency for components:', { car, character, glider, wheel, track });

    res.redirect('/');
  } catch (error) {
    console.error(`Error generating weekly setup or incrementing selection frequency: ${error.message}`, error.stack);
    res.status(500).send('Error generating weekly setup. Please try again later.');
  }
});

// GET route for the admin settings page
router.get('/admin/settings', isAuthenticated, async (req, res) => {
  try {
    let settings = await AppSettings.findOne({});
    if (!settings) {
      // If no settings found, create a default settings object
      settings = new AppSettings({ allowNewSignups: true });
      await settings.save();
      console.log('No settings found, created default settings.');
    }
    res.render('admin/settings', { settings });
    console.log('Rendered admin settings page with settings:', settings);
  } catch (error) {
    console.error(`Error rendering admin settings page: ${error.message}`, error.stack);
    res.status(500).send('Error loading settings page');
  }
});

// POST route to update settings
router.post('/admin/settings', isAuthenticated, async (req, res) => {
  try {
    const { allowNewSignups } = req.body;
    await AppSettings.updateOne({}, { $set: { allowNewSignups: allowNewSignups === 'on' } });
    console.log('Updated allowNewSignups setting to:', allowNewSignups);
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(`Error updating settings: ${error.message}`, error.stack);
    res.status(500).send('Error updating settings. Please try again later.');
  }
});

module.exports = router;