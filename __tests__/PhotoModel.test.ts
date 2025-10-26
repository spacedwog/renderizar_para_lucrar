import {PhotoModel} from '../src/models/PhotoModel';

describe('PhotoModel', () => {
  it('should create a valid photo model', () => {
    const photo: PhotoModel = {
      id: 1,
      uri: 'file:///test/photo.jpg',
      name: 'test-photo.jpg',
      timestamp: '2023-10-26T10:00:00Z',
      ar_rendered: false,
      metadata: {
        width: 1920,
        height: 1080,
        size: 2048000,
      },
    };

    expect(photo.id).toBe(1);
    expect(photo.name).toBe('test-photo.jpg');
    expect(photo.ar_rendered).toBe(false);
    expect(photo.metadata.width).toBe(1920);
    expect(photo.metadata.height).toBe(1080);
  });

  it('should handle AR rendered status', () => {
    const photo: PhotoModel = {
      id: 2,
      uri: 'file:///test/ar-photo.jpg',
      name: 'ar-photo.jpg',
      timestamp: '2023-10-26T11:00:00Z',
      ar_rendered: true,
      metadata: {
        width: 2560,
        height: 1440,
        size: 3072000,
      },
    };

    expect(photo.ar_rendered).toBe(true);
  });
});