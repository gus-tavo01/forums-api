require('dotenv').config();
const EmailsService = require('../../../services/Emails.Service');

const emailsService = new EmailsService();
describe('EmailsService sendEmail', () => {
  beforeAll(() => {
    jest.setTimeout = 15000;
  });

  test('When content is text, expect to be successful', async () => {
    // Arrange
    const emailData = {
      from: 'unit.test@mail.com',
      to: 'gustavoa.loera01@gmail.com',
      subject: 'Gud provech',
      text: 'Hello Integration test',
      html: '<div><h3>This is for testing</h3></div>',
    };

    // Act
    const response = await emailsService.send(emailData);

    console.log('# email response');
    console.log(response);

    // Assert
    expect(response).toHaveProperty('messageId');
  });
});
