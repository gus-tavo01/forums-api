const mongoose = require('mongoose');

module.exports = () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const dbName = process.env.DB_NAME || 'Forums-Db';
  const uri = `mongodb://${host}/${dbName}`;

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  return mongoose.connection;
};
