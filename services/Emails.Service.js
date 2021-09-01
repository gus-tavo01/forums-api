const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

class EmailsService {
  constructor() {
    if (process.env.DEVELOPMENT) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PWD,
        },
      });
    } else {
      const auth = {
        auth: {
          api_key: process.env.MG_API_KEY,
          domain: process.env.MG_DOMAIN,
        },
      };

      this.transporter = nodemailer.createTransport(mg(auth));
    }
  }

  send = async (email) => {
    try {
      return this.transporter.sendMail(email);
    } catch (err) {
      return { message: err.message };
    }
  };
}

module.exports = EmailsService;
