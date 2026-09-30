const path = require('path');

const viewsPath = path.resolve(__dirname, '../views');

const getHomeView = (req, res) => {
  res.sendFile(path.join(viewsPath, 'home.html'));
};

const getAboutView = (req, res) => {
  res.sendFile(path.join(viewsPath, 'about.html'));
};

module.exports = {
  getHomeView,
  getAboutView,
};
