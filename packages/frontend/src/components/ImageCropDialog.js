import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider
} from '@mui/material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '../styles/ImageCrop.css';

const ImageCropDialog = ({ 
  open, 
  onClose, 
  onCropComplete, 
  imageUrl,
  aspectRatio = 16 / 9 // Varsayılan olarak restaurant kartları için uygun oran
}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const getCroppedImg = (image, crop, fileName = 'cropped-image.jpg') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * scaleX * pixelRatio;
    canvas.height = crop.height * scaleY * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          resolve(file);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleCropComplete = async () => {
    if (imgRef.current && crop.width && crop.height) {
      try {
        const croppedImageFile = await getCroppedImg(imgRef.current, crop);
        onCropComplete(croppedImageFile);
        onClose();
      } catch (error) {
        console.error('Resim kırpma hatası:', error);
      }
    }
  };

  const handleImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop({
      unit: '%',
      width: 90,
      height: (90 * height) / width,
      x: 5,
      y: 5
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#ff8800', 
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Resmi Düzenle
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
          Resminizin hangi kısmının kullanılacağını seçin. Seçili alan restaurant kartında görünecektir.
        </Typography>
        
        {imageUrl && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 3,
            '& .ReactCrop': {
              maxWidth: '100%',
              maxHeight: '400px'
            },
            '& .ReactCrop__crop-selection': {
              border: '2px solid #ff8800',
              backgroundColor: 'rgba(255, 136, 0, 0.1)'
            }
          }}>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={aspectRatio}
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Kırpılacak resim"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '400px',
                  transform: `scale(${scale}) rotate(${rotate}deg)`
                }}
                onLoad={handleImageLoad}
              />
            </ReactCrop>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Yakınlaştırma
          </Typography>
          <Slider
            value={scale}
            min={0.5}
            max={3}
            step={0.1}
            onChange={(_, value) => setScale(value)}
            sx={{ 
              color: '#ff8800',
              '& .MuiSlider-thumb': {
                backgroundColor: '#ff8800'
              },
              '& .MuiSlider-track': {
                backgroundColor: '#ff8800'
              }
            }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Döndürme
          </Typography>
          <Slider
            value={rotate}
            min={-180}
            max={180}
            step={1}
            onChange={(_, value) => setRotate(value)}
            sx={{ 
              color: '#ff8800',
              '& .MuiSlider-thumb': {
                backgroundColor: '#ff8800'
              },
              '& .MuiSlider-track': {
                backgroundColor: '#ff8800'
              }
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderColor: '#ddd',
            color: '#666',
            '&:hover': {
              borderColor: '#bbb',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleCropComplete}
          variant="contained"
          sx={{ 
            backgroundColor: '#ff8800',
            '&:hover': {
              backgroundColor: '#ff7700'
            }
          }}
        >
          Kırpmayı Uygula
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropDialog;
