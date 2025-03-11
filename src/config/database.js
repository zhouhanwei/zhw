const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tmp', 'root', '871229zhw', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;