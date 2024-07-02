const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const IPAPI_URL = 'http://ipapi.co';
const OPENWEATHERMAP_URL = 'http://api.openweathermap.org/data/2.5/weather';
const OPENWEATHERMAP_API_KEY = 'your_openweathermap_api_key'; // Replace with your OpenWeatherMap API key

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        // Get location based on IP address
        const locationResponse = await axios.get(`${IPAPI_URL}/${clientIp}/json`);
        const city = locationResponse.data.city || 'Unknown city';
        const country = locationResponse.data.country_name || 'Unknown country';
        const location = `${city}, ${country}`; // Combining city and country for a more precise location

        // Get weather data based on location
        const weatherResponse = await axios.get(`${OPENWEATHERMAP_URL}`, {
            params: {
                q: city, // Using just the city for weather query
                appid: OPENWEATHERMAP_API_KEY,
                units: 'metric'
            }
        });
        const temperature = weatherResponse.data.main.temp;

        const greeting = `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`;
        res.json({
            client_ip: clientIp,
            location: location,
            greeting: greeting
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});