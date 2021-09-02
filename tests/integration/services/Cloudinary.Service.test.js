require('dotenv').config();
const CloudinaryService = require('../../../services/Cloudinary.Service');

const cloudinaryService = new CloudinaryService();

describe('Cloudinary Service uploadImage', () => {
  test('When image data is a valid image, expect to be uploaded on cloud', async () => {
    // Arrange
    const image = 'imageBase64String'; // TODO add a valid string
    const preset = 'setAvatar';

    // Act
    const uploadResponse = await cloudinaryService.uploadImage(image, preset);

    // Assert
    expect(uploadResponse).not.toBeNull();
  });
});
