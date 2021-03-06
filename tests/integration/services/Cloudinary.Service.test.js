require('dotenv').config();
const CloudinaryService = require('../../../services/Cloudinary.Service');
const { imageUrl } = require('../../helpers/mockImageUrl');

const ImageFolders = require('../../../common/constants/cloudinaryFolders');

const cloudinaryService = new CloudinaryService();

describe('Cloudinary Service uploadImage', () => {
  test('When image data is a valid image, expect to be uploaded on cloud', async () => {
    // Arrange
    const image = imageUrl;
    const preset = ImageFolders.avatars;

    // Act
    const uploadResponse = await cloudinaryService.uploadImage(image, preset);

    // Assert
    expect(uploadResponse).not.toBeNull();
  });
});
