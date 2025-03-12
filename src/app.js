const express = require('express');
const http = require('http');
const cors = require('cors');
const scraperRoutes = require('./routes/scraperRoutes');
const sequelize = require('./config/database');
const { setupSocket } = require('./socket');
const scraperService = require('./services/scraperService');
const Article = require('./models/Article');

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
  // 服务器启动时检查数据库中的数据数量
  try {
    const articleCount = await Article.count();
    if (articleCount < 500) {
      await scraperService.scrape(5);
      console.log('成功获取5页数据');
    } else {
      console.log('数据库中的数据数量超过500,不执行初始爬取操作');
    }
  } catch (error) {
    console.error('检查数据库中的数据数量时出错', error);
  }

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

setupSocket(server);