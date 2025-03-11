const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');
const ArticleDetail = require('../models/ArticleDetail');
const cron = require('node-cron');
const { emitUpdate } = require('../socket');

const baseUrl = 'https://www.msa.gov.cn/page/channelArticles.do';
const channelids = {
  '94DF14CE-1110-415D-A44E-67593E76619F': '上海海事局',
  '93404234-06CC-4507-B2FB-8AF2492D2A3D': '长江海事局',
  'BDBA5FAD-6E5D-4867-9F97-0FCF8EFB8636': '天津海事局',
  'B5B0F3C7-630D-4967-B1E6-B06208575D15': '江苏海事局',
  'C8896863-B101-4C43-8705-536A03EB46FF': '辽宁海事局',
  '93B73989-D220-45F9-BC32-70A6EBA35180': '河北海事局',
  '36EA3354-C8F8-4953-ABA0-82D6D989C750': '山东海事局',
  '8E10EA74-EB9E-4C96-90F8-F891968ADD80': '浙江海事局',
  '7B084057-6038-4570-A0FB-44E9204C4B1D': '福建海事局',
  '1E478D40-9E85-4918-BF12-478B8A19F4A8': '广东海事局',
  '86DE2FFF-FF2C-47F9-8359-FD1F20D6508F': '广西海事局',
  'D3340711-057B-494B-8FA0-9EEDC4C5EAD9': '海南海事局',
  '2C788629-ACCF-4AD5-8969-B28FA1E0AAEE': '黑龙江海事局',
  '325FDC08-92B4-4313-A63E-E5C165BE98EC': '深圳海事局'
};

// 循环各个地区海事网的数据
const cyclicallyObtainAreaInformation = async (maxPages = 1, isSocket = false) => {
  for (var index in channelids) {
    console.log(`正在获取${channelids[index]}的信息`);
    await cyclicallyObtainInformation(maxPages, isSocket, index, channelids[index]);  
  };
};

// 循环获取信息
const cyclicallyObtainInformation = async (maxPages = 1, isSocket = false, channelid, areaName) => {
  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    const { data } = await axios.get(`${baseUrl}?channelids=${channelid}&currentPage=${currentPage}`);
    const $ = cheerio.load(data);

    $('.list_wrapper ul').each((index, element) => {
      $(element).find('li').each(async (index, childElement) => {
        const father = $(childElement);
        const title = $(childElement).find('a span').attr('title');
        const date = $(childElement).find('a').siblings('span').text().trim();
        const link = father.find('a').attr('href');
        const articleId = new URL(link, baseUrl).searchParams.get('articleId');
        const channelId = new URL(link, baseUrl).searchParams.get('channelId');

        // 检查是否已存在
        const existingArticle = await Article.findOne({ where: { articleId, channelId } });
        if (!existingArticle) {
          // 存储到数据库
          const newArticle = await Article.create({ title, date, articleId, channelId, areaName });
          if (isSocket) {
            emitUpdate(newArticle); // 推送更新的数据
          }
        }
      });
    });
  }
};

// 定时任务：每隔半小时拉取新的消息
cron.schedule('*/30 * * * *', async () => {
  try {
    await cyclicallyObtainAreaInformation(1, true);
    console.log('定时任务：成功拉取新的消息');
  } catch (error) {
    console.error('定时任务：拉取新的消息时出错', error);
  }
});

//
exports.scrape = async (maxPages = 1) => {
  try {
    await cyclicallyObtainAreaInformation(maxPages);
  } catch (error) {
    throw new Error('获取列表页面数据时出错');
  }
};

exports.getDetail = async (link, channelId, articleId) => {
  try {
    console.log('link', link);
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);
    const title = $('.content_wrapper').find('#title').text().trim();
    const info = $('.content_wrapper').find('.pull-left').find('span:lt(3)').text().trim();
    const content = $('.content_wrapper').find('#ch_p').find('p').text().trim();
    // 检查数据库中是否有当前列表的详情页
    const existingDetail = await ArticleDetail.findOne({ where: { articleId, channelId } });
    if (!existingDetail) {
      // 存储数据到数据库
      await ArticleDetail.create({ title, info, content, articleId, channelId });
    }
    // 返回文章详情
    return {title, info, content, articleId, channelId};
  } catch (error) {
    throw new Error('获取详情页面数据时出错');
  }
};

exports.getAllArticles = async () => {
  try {
    const articles = await Article.findAll();
    return articles;
  } catch (error) {
    throw new Error('获取数据库中的数据时出错');
  }
};