const mongoose = require('mongoose');

module.exports = () => {
  const uri = process.env.DB_CONNECTION;

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  return mongoose.connection;
};
