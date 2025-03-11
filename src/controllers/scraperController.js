const scraperService = require('../services/scraperService');
const { createResponse } = require('../helpers/responseHelper');

exports.scrapeData = async (req, res) => {
  try {
    const data = await scraperService.scrape();
    res.json(createResponse('success', 'Data scraped successfully', data));
  } catch (error) {
    res.status(500).json(createResponse('error', error.message));
  }
};

exports.getDetailData = async (req, res) => {
  try {
    const { channelId, articleId } = req.query;
    if (!channelId || !articleId) {
      return res.status(400).json(createResponse('error', 'channelId and articleId are required'));
    }
    const link = `https://www.msa.gov.cn/page/article.do?articleId=${articleId}&channelId=${channelId}`;
    const data = await scraperService.getDetail(link);
    res.json(createResponse('success', 'Detail data fetched successfully', data));
  } catch (error) {
    res.status(500).json(createResponse('error', error.message));
  }
};

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await scraperService.getAllArticles();
    res.status(200).json(createResponse('success', 'Articles fetched successfully', articles));
  } catch (error) {
    res.status(500).json(createResponse('error', error.message));
  }
};