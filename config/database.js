const mongoose = require('mongoose');

module.exports = () => {
  const uri = process.env.DB_CONNECTION;
  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  };
  mongoose.connect(uri, opts);
  return mongoose.connection;
};
