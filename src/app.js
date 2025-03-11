const express = require('express');
const http = require('http');
const cors = require('cors');
const scraperRoutes = require('./routes/scraperRoutes');
const sequelize = require('./config/database');
const { setupSocket } = require('./socket');
const scraperService = require('./services/scraperService');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// 使用 cors 中间件
app.use(cors());

app.use('/scrape', scraperRoutes);
app.use('/', (req, res) => {
  res.send('海事局数据');
});

sequelize.sync().then(async () => {
  // 服务器启动时获取5页数据
  try {
    await scraperService.scrape(5);
    console.log('成功获取5页数据');
  } catch (error) {
    console.error('获取5页数据时出错', error);
  }

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

setupSocket(server);