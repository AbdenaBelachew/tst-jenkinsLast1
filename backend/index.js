const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'Online', 
        message: 'Backend is running and connected!',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
