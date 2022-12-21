const cheerio = require("cheerio");
const https = require("https");
const newsCtrl = {
  getHotNews: async (req, res) => {
    try {
      https.get("https://vnexpress.net/tin-nong", async (response) => {
        let articles = [];
        response.on("data", (chunk) => {
          $ = cheerio.load(chunk);
          var test = $(".item-news");
          test.each((i, e) => {
            const newsTitle = $(e).children(".title-news").text();
            const newsUrl = $(e)
              .children(".title-news")
              .children("a")
              .first()
              .attr("href");
            const newsImg = $(e)
              .children(".thumb-art")
              .find("img")
              .attr("data-src");
            if (newsTitle && newsUrl && newsImg) {
              articles.push({ newsTitle, newsUrl, newsImg });
            }
          });
        });
        response.on("end", () => {
          return res.status(200).json(articles.slice(0, 8));
        });
      });
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
};

module.exports = newsCtrl;
