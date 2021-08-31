require('dotenv').config();
const EmailsService = require('../../../services/Emails.Service');

describe('EmailsService sendEmail', () => {
  let emailsService;
  beforeAll(() => {
    jest.setTimeout = 15000;
    emailsService = new EmailsService();
  });

  test('When content is text, expect to be successful', async () => {
    // Arrange
    const emailData = {
      from: 'unit.test@mail.com',
      to: 'gustavoa.loera01@gmail.com',
      subject: 'Test email',
      text: 'Hello Integration test',
    };

    // Act
    const response = await emailsService.send(emailData);

    // Assert
    expect(response).toHaveProperty('message', 'Queued. Thank you.');
  });
});
