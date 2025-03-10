const scraperService = require('../services/scraperService');

exports.scrapeData = async (req, res) => {
  try {
    const data = await scraperService.scrape();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDetailData = async (req, res) => {
  try {
    const { channelId, articleId } = req.query;
    if (!channelId || !articleId) {
      return res.status(400).json({ error: 'channelId and articleId are required' });
    }
    const link = `https://www.msa.gov.cn/page/article.do?articleId=${articleId}&channelId=${channelId}`;
    const data = await scraperService.getDetail(link);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};