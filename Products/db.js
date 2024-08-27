const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'dummy.json');
    res.sendFile(filePath);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
