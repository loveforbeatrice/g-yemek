import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CommentIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const MenuItemRating = ({ menuItemId, businessId, initialRating = 0 }) => {
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleOpenComments = async () => {
    setDialogOpen(true);
    setLoading(true);
    
    try {
      // Fetch ratings/comments for this menu item
      const response = await axios.get(`/api/ratings/menuItem/${menuItemId}`);
      if (response.data && response.data.success) {
        setComments(response.data.ratings || []);
      }
    } catch (error) {
      console.error('Error fetching item comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseComments = () => {
    setDialogOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StarIcon sx={{ color: '#FF8800', fontSize: '1rem', mr: 0.5 }} />
        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 0.5 }}>
          {initialRating.toFixed(1)}
        </Typography>
        <IconButton 
          onClick={handleOpenComments}
          sx={{ 
            p: 0.25, 
            ml: -0.5, 
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } 
          }}
        >
          <CommentIcon sx={{ fontSize: '1rem', color: '#777' }} />
        </IconButton>
      </Box>

      {/* Comments Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseComments}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t('Reviews')}
          <IconButton onClick={handleCloseComments} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : comments.length > 0 ? (
            <List>
              {comments.map((comment, index) => (
                <React.Fragment key={comment.id || index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography component="span" variant="subtitle2">
                            {comment.user?.name || t('Anonymous')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon sx={{ color: '#FF8800', fontSize: '1rem' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 0.5 }}>
                              {comment.foodRating?.toFixed(1)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {comment.comment || t('No comment provided')}
                          </Typography>
                          <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < comments.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1">
                {t('No reviews yet for this item')}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuItemRating;
