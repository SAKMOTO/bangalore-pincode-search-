const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Load pincode data
const pincodeData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/bangalore-pincodes.json'), 'utf8'));

// Helper function to create area to pincode mapping
const createAreaToPincodeMap = () => {
  const areaMap = {};
  pincodeData.pincodes.forEach(entry => {
    entry.areas.forEach(area => {
      const normalizedArea = area.toLowerCase().trim();
      if (!areaMap[normalizedArea]) {
        areaMap[normalizedArea] = [];
      }
      areaMap[normalizedArea].push(entry.pincode);
    });
  });
  return areaMap;
};

const areaToPincodeMap = createAreaToPincodeMap();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bangalore Pincode Search API is running' });
});

// Search by pincode
app.get('/api/search/pincode/:pincode', (req, res) => {
  const { pincode } = req.params;
  
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ 
      error: 'Invalid pincode format. Please provide a 6-digit pincode.' 
    });
  }

  const result = pincodeData.pincodes.find(entry => entry.pincode === pincode);
  
  if (!result) {
    return res.status(404).json({ 
      error: 'Pincode not found in Bangalore database' 
    });
  }

  res.json({
    pincode: result.pincode,
    areas: result.areas,
    count: result.areas.length
  });
});

// Search by area name
app.get('/api/search/area/:areaName', (req, res) => {
  const { areaName } = req.params;
  
  if (!areaName || areaName.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Invalid area name. Please provide at least 2 characters.' 
    });
  }

  const normalizedArea = areaName.toLowerCase().trim();
  const result = areaToPincodeMap[normalizedArea];
  
  if (!result) {
    return res.status(404).json({ 
      error: 'Area not found in Bangalore database' 
    });
  }

  res.json({
    area: areaName.trim(),
    pincodes: result,
    count: result.length
  });
});

// Search areas by partial name (autocomplete)
app.get('/api/search/areas/:query', (req, res) => {
  const { query } = req.params;
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Invalid search query. Please provide at least 2 characters.' 
    });
  }

  const normalizedQuery = query.toLowerCase().trim();
  const matches = [];

  pincodeData.pincodes.forEach(entry => {
    entry.areas.forEach(area => {
      if (area.toLowerCase().includes(normalizedQuery)) {
        matches.push({
          area: area,
          pincode: entry.pincode
        });
      }
    });
  });

  // Remove duplicates and sort
  const uniqueMatches = matches.filter((match, index, self) =>
    index === self.findIndex((m) => m.area === match.area)
  ).sort((a, b) => a.area.localeCompare(b.area));

  res.json({
    query: query.trim(),
    matches: uniqueMatches,
    count: uniqueMatches.length
  });
});

// Get all pincodes
app.get('/api/pincodes', (req, res) => {
  const pincodes = pincodeData.pincodes.map(entry => entry.pincode).sort();
  res.json({
    pincodes,
    count: pincodes.length
  });
});

// Get all areas
app.get('/api/areas', (req, res) => {
  const allAreas = new Set();
  pincodeData.pincodes.forEach(entry => {
    entry.areas.forEach(area => allAreas.add(area));
  });
  
  const areasArray = Array.from(allAreas).sort();
  res.json({
    areas: areasArray,
    count: areasArray.length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Bangalore Pincode Search API running on port ${PORT}`);
  console.log(`📊 Loaded ${pincodeData.pincodes.length} pincodes`);
  console.log(`📍 Total areas: ${new Set(pincodeData.pincodes.flatMap(entry => entry.areas)).size}`);
});
