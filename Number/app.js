const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

const windowSize = 10;
let numbers = [];

function fetchNumbers(numberid) {
    const url = `http://localhost:3000/numbers/${numberid}`;
    return axios.get(url)
        .then(response => response.data.numbers)
        .catch(error => {
            console.error('Error fetching numbers:', error.message);
            return [];
        });
}

function addNumbers(newNumbers) {
    newNumbers.forEach(number => {
        if (!numbers.includes(number)) {
            if (numbers.length === windowSize) {
                numbers.shift();
            }
            numbers.push(number);
        }
    });
}

function getAverage() {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;

    try {
        const fetchedNumbers = await fetchNumbers(numberid);
        const prevState = [...numbers];

        addNumbers(fetchedNumbers);

        const response = {
            numbers: fetchedNumbers,
            windowPrevState: prevState,
            windowCurrState: numbers,
            avg: getAverage()
        };

        res.json(response);
    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`API is running on port ${port}`);
});
