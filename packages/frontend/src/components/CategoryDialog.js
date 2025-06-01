import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function CategoryDialog({ open, handleClose }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch categories when the dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Categories could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/categories',
        { name: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setCategories([...categories, response.data]);
      setNewCategory('');
      setError('');
    } catch (err) {
      console.error('Error adding category:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Category could not be added');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update a category
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3001/api/categories/${editingCategory.id}`,
        { name: editingCategory.name.trim() },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? response.data : cat
      ));
      setEditingCategory(null);
      setError('');
    } catch (err) {
      console.error('Error updating category:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Category could not be updated');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This may affect menu items using this category.")) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3001/api/categories/${id}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setCategories(categories.filter(cat => cat.id !== id));
      if (editingCategory?.id === id) {
        setEditingCategory(null);
      }
      setError('');
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Category could not be deleted');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Categories</DialogTitle>
      <DialogContent>
        {loading && categories.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            
            {/* Add new category */}
            <Box sx={{ display: 'flex', mb: 2, mt: 1 }}>
              <TextField
                label="New Category"
                variant="outlined"
                fullWidth
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                size="small"
                disabled={loading}
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleAddCategory} 
                sx={{ ml: 1 }}
                disabled={!newCategory.trim() || loading}
              >
                Add
              </Button>
            </Box>
            
            {/* Edit category */}
            {editingCategory && (
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  label="Edit Category"
                  variant="outlined"
                  fullWidth
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ 
                    ...editingCategory, 
                    name: e.target.value 
                  })}
                  size="small"
                  disabled={loading}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleUpdateCategory} 
                  sx={{ ml: 1 }}
                  disabled={!editingCategory.name.trim() || loading}
                >
                  Update
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setEditingCategory(null)} 
                  sx={{ ml: 1 }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            )}
            
            {/* Category List */}
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {categories.length === 0 ? (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  No categories yet. Add one above!
                </Typography>
              ) : (
                categories.map((category) => (
                  <React.Fragment key={category.id}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton 
                            edge="end" 
                            onClick={() => setEditingCategory(category)}
                            disabled={loading || editingCategory?.id === category.id}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={loading}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText primary={category.name} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryDialog;
