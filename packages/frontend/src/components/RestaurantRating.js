import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const RestaurantRating = ({ businessId }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      if (!businessId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/ratings/business/${businessId}`);
        
        if (response.data && response.data.success && response.data.business) {
          setRating({
            averageRating: response.data.business.averageRating || 0,
            totalRatings: response.data.business.totalRatings || 0
          });
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching restaurant rating:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [businessId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="rounded" width={120} height={24} />
      </Box>
    );
  }

  if (error || !rating) {
    return null; // Don't show anything if there's an error
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <StarIcon sx={{ color: '#FF8800' }} />
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        {rating.averageRating.toFixed(1)}
      </Typography>
    </Box>
  );
};

export default RestaurantRating;
