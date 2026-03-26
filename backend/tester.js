const express = require('express');
const app = express();
app.get('/tester', (req, res) => res.send('TESTER ALIVE'));
app.listen(5000, '127.0.0.1', () => console.log('Tester on 5000'));
