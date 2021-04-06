const express = require('express');
const port = process.env.PORT || 5000;
const app = express();

app.get('/', (req, res) => {
  res.status(200).json({status: 'Success', description: 'Muy bien'});
});

app.listen(port, () => {
  console.log(`App running on PORT: ${port}`);
});