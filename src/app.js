const express = require('express');
const scraperRoutes = require('./routes/scraperRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Routes
app.use('/scrape', scraperRoutes);
app.use('/', (req, res) => {
  res.send('海事局数据');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});