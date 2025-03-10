const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://www.msa.gov.cn/page/channelArticles.do';
const channelids = '94DF14CE-1110-415D-A44E-67593E76619F';
const maxPages = 5;

// 循环获取信息-目前支持到5页
const cyclicallyObtainInformation = async () => {
  const articles = [];
  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    const { data } = await axios.get(`${baseUrl}?channelids=${channelids}&currentPage=${currentPage}`);
    const $ = cheerio.load(data);

    $('.list_wrapper ul').each((index, element) => {
      $(element).find('li').each((index, childElement) => {
        const father = $(childElement);
        const title = $(childElement).find('a span').attr('title');
        const date = $(childElement).find('a').siblings('span').text().trim();
        const link = father.find('a').attr('href');
        articles.push({ title, link, date });
      });
    });
  }
  return articles;
};

// 获取详情页数据
const getDetailPageData = async (link) => {
  try {
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);
    const title = $('.content_wrapper').find('#title').text().trim();
    const info = $('.content_wrapper').find('.pull-left').find('span:lt(3)').text().trim();
    const content = $('.content_wrapper').find('#ch_p').find('p').text().trim();
    return {title, info, content};
  } catch (error) {
    throw new Error('获取详情页面数据时出错');
  }
};

exports.scrape = async () => {
  try {
    const articles = await cyclicallyObtainInformation();
    return articles;
  } catch (error) {
    throw new Error('获取列表页面数据时出错');
  }
};

exports.getDetail = async (link) => {
  try {
    const content = await getDetailPageData(link);
    return content;
  } catch (error) {
    throw new Error('获取详情页面数据时出错');
  }
};