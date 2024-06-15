const fs = require('fs');
const path = require('path');

// Function to increment the selection frequency for the chosen setup components
const incrementSelectionFrequency = async ({ car, character, glider, wheel, track }) => {
  try {
    // Paths for the JSON files
    const files = {
      cars: path.join(__dirname, '..', 'data', 'cars.json'),
      characters: path.join(__dirname, '..', 'data', 'characters.json'),
      gliders: path.join(__dirname, '..', 'data', 'gliders.json'),
      wheels: path.join(__dirname, '..', 'data', 'wheels.json'),
      tracks: path.join(__dirname, '..', 'data', 'tracks.json')
    };

    // Increment the frequency for each component
    for (const [component, filePath] of Object.entries(files)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const selectedItem = { car, character, glider, wheel, track }[component];

      if (data[selectedItem]) {
        if (!data[selectedItem].frequency) {
          data[selectedItem].frequency = 1;
        } else {
          data[selectedItem].frequency += 1;
        }
      } else {
        console.log(`No matching ${component} found for selection: ${selectedItem}`);
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Incremented frequency for ${component}: ${selectedItem}`);
    }
  } catch (error) {
    console.error('Error incrementing selection frequency:', error.message, error.stack);
    throw error;
  }
};

module.exports = {
  incrementSelectionFrequency
};