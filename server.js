const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Function to get the real IP address
const getClientIp = (req) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === '::ffff:127.0.0.1') {
        return '8.8.8.8'; // Use Google's public DNS IP for testing
    }
    return clientIp;
};

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name;
    const clientIp = getClientIp(req);

    try {
        // Get location data from ipinfo.io
        const locationResponse = await axios.get(`https://ipinfo.io/${clientIp}?token=39e93a01118816`);
        console.log('Location data received:', locationResponse.data);
        const locationData = locationResponse.data;
        const city = locationData.city;
        const region = locationData.region;

        if (!city) {
            throw new Error('City not found in location data.');
        }

        // Get weather data from weatherapi.com
        const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=8b92add9cde4429880472111240107&q=${city}`);
        const temperature = weatherResponse.data.current.temp_c;

        res.json({
            client_ip: clientIp,
            location: `${city}, ${region}`,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}`
        });
    } catch (error) {
        console.error('Error occurred:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});