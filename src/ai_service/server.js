const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: 'mock-policy-v1' });
});

app.post('/predict', (req, res) => {
  const { source, payload } = req.body;
  // Logic mock đơn giản: nếu payload có "anomaly" thì trả alert
  const prediction = payload && payload.anomaly ? 'alert' : 'normal';
  res.json({
    prediction,
    confidence: 0.92,
    model: 'mock-policy-v1',
  });
});

app.listen(9000, '0.0.0.0', () => console.log('AI mock service running on port 9000'));