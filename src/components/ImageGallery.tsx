import React from 'react';

interface ImageGalleryProps {
  images: { url: string; prompt?: string }[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  if (!images.length) return <div style={{ color: '#aaa', textAlign: 'center' }}>Brak ilustracji.</div>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {images.map((img, i) => (
        <div key={i} style={{ background: '#222', borderRadius: 8, padding: 8, width: 120, textAlign: 'center' }}>
          <img src={img.url} alt={img.prompt || 'Ilustracja'} style={{ width: '100%', borderRadius: 6, marginBottom: 6 }} />
          {img.prompt && <div style={{ color: '#90caf9', fontSize: 12 }}>{img.prompt}</div>}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
