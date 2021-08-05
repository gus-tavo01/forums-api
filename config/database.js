const mongoose = require('mongoose');

module.exports = {
  connect: () => {
    const uri = process.env.DB_CONNECTION;
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    };
    mongoose.connect(uri, opts);
    return mongoose.connection;
  },
  disconnect: () => mongoose.disconnect(),
};
