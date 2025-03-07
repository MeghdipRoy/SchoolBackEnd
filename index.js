const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

//  Add School API - POST /addSchool
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validate input data
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add school.' });
        }
        res.status(201).json({ message: 'School added successfully.' });
    });
});

//  List Schools API - GET /listSchools
app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const sql = 'SELECT * FROM schools';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch schools.' });
        }

        // Calculate distance and sort by proximity
        const userLat = parseFloat(latitude);
        const userLon = parseFloat(longitude);

        const sortedSchools = results.map((school) => {
            const distance = Math.sqrt(
                Math.pow(userLat - school.latitude, 2) + Math.pow(userLon - school.longitude, 2)
            );
            return { ...school, distance };
        }).sort((a, b) => a.distance - b.distance);

        res.json(sortedSchools);
    });
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
