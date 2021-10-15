const mongoose = require('mongoose');

module.exports = {
  connect: async () => {
    const uri = process.env.DB_CONNECTION;
    const connection = await mongoose.connect(uri);
    return connection;
  },
  disconnect: async () => mongoose.disconnect(),
};
