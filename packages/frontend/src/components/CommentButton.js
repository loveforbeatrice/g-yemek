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
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const CommentButton = ({ menuItemId, commentCount = 0 }) => {
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ChatBubbleOutlineIcon sx={{ color: '#aaa', fontSize: '1.2rem' }} />
        <Typography variant="caption" sx={{ color: '#aaa', fontWeight: 'bold' }}>
          {commentCount}
        </Typography>
      </Box>

      {/* Comments Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseComments}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t('Yorumlar')}
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
                            {comment.user?.name || t('Anonim')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {comment.foodRating?.toFixed(1)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {comment.comment || t('Yorum yapılmamış')}
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
                {t('Bu ürün için henüz yorum yok')}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommentButton;
