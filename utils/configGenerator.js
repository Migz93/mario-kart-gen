const fs = require('fs');
const path = require('path');
const Setup = require('../models/Setup'); // Assuming you have a Setup model for MongoDB
const { incrementSelectionFrequency } = require('./selectionFrequencyTracker'); // Import the incrementSelectionFrequency function

// Function to load options from JSON files and return them as objects
function loadOptions(fileName) {
  const filePath = path.join(__dirname, '..', 'data', fileName);
  try {
    const options = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Loaded options from ${fileName}`);
    return options;
  } catch (error) {
    console.error(`Error loading options from ${fileName}: ${error.message}`, error.stack);
    throw error;
  }
}

// Function to prioritize options based on less frequency picked items
function prioritizeOptions(options) {
  // Convert options object to array and sort based on frequency
  const prioritizedOptions = Object.entries(options)
    .filter(([key, value]) => value.Enable)
    .sort((a, b) => {
      const frequencyA = a[1].frequency || 0;
      const frequencyB = b[1].frequency || 0;
      return frequencyA - frequencyB;
    })
    .map(([key]) => key); // Extract the key (name) of the option
  console.log(`Prioritized options based on frequency.`);
  return prioritizedOptions;
}

exports.loadCarsOptions = () => prioritizeOptions(loadOptions('cars.json'));
exports.loadCharactersOptions = () => prioritizeOptions(loadOptions('characters.json'));
exports.loadGlidersOptions = () => prioritizeOptions(loadOptions('gliders.json'));
exports.loadWheelsOptions = () => prioritizeOptions(loadOptions('wheels.json'));
exports.loadTracksOptions = () => prioritizeOptions(loadOptions('tracks.json'));

exports.generateWeeklySetup = async ({ car, character, glider, wheel, track }) => {
  const setup = new Setup({ car, character, glider, wheel, track, week: new Date() });
  try {
    await setup.save();
    console.log('Weekly setup generated and saved to MongoDB:', { car, character, glider, wheel, track });

    // After saving the setup, increment the selection frequency for each component
    await incrementSelectionFrequency({ car, character, glider, wheel, track });
    console.log('Incremented selection frequency for components:', { car, character, glider, wheel, track });
  } catch (error) {
    console.error(`Error saving weekly setup to MongoDB or incrementing selection frequency: ${error.message}`, error.stack);
    throw error; // Rethrow the error after logging to ensure it can be caught by the caller
  }
};