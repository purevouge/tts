// server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware
app.use(cors({
    //origin: '*', // Allow all origins for now, you can restrict later for security
    origin: 'https://tts-pearl-two.vercel.app/',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API route to fetch audio
app.post('/api/fetch-audio', async (req, res) => {
    const { text } = req.body;

    try {
        const response = await axios.post('https://api.sws.speechify.com/v1/audio/stream', {
            audio_format: 'mp3',
            input: text,
            model: 'simba-base',
            voice_id: '74ec9289-c9e0-4083-8aa4-346ade92bcc8',
            language: 'en-US'
        }, {
            headers: {
                'Authorization': process.env.API_KEY, // Use environment variable for API key
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer' // Ensure binary response
        });

        if (response.status === 200) {
            const audioBlob = Buffer.from(response.data, 'binary'); // Create a Buffer from binary data
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'inline',
                'Content-Length': audioBlob.length
            });
            res.send(audioBlob); // Send the binary audio data
        } else {
            res.status(response.status).send(response.statusText);
        }
    } catch (error) {
        console.error('Error fetching audio:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
/* app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); */