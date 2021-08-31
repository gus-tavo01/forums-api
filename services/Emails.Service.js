const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

class EmailsService {
  send = async (email) => {
    try {
      const auth = {
        auth: {
          api_key: process.env.MG_API_KEY,
          domain: process.env.MG_DOMAIN,
        },
      };

      const nodemailerMailgun = nodemailer.createTransport(mg(auth));

      return nodemailerMailgun.sendMail(email);
    } catch (err) {
      return { message: err.message };
    }
  };
}

module.exports = EmailsService;
