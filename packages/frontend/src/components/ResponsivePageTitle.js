import React from 'react';
import { Typography, useMediaQuery, useTheme } from '@mui/material';

/**
 * A responsive page title component that adjusts font size based on screen size
 * 
 * @param {Object} props - Component props
 * @param {string} props.children - The title text
 * @param {Object} props.sx - Additional sx props for the Typography component
 * @returns {JSX.Element} Responsive Typography component
 */
function ResponsivePageTitle({ children, sx = {}, ...props }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Typography 
      variant={isMobile ? "h5" : "h3"} 
      align="center" 
      sx={{ 
        fontWeight: 'bold', 
        mb: 4,
        ...sx
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}

export default ResponsivePageTitle;
