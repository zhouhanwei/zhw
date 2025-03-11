const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

// 列表
router.get('/', scraperController.getAllArticles);
// 详情
router.get('/detail', scraperController.getDetailData);

module.exports = router;