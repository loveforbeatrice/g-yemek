# Gülbahçe Food Ordering Platform - Project Architecture

This document provides a comprehensive overview of the project architecture, design system, and guidelines for future development of the Gülbahçe Food Ordering Platform.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Architecture](#architecture)
4. [Design System](#design-system)
5. [Component Guidelines](#component-guidelines)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Authentication Flow](#authentication-flow)
9. [Development Guidelines](#development-guidelines)
10. [Adding New Features](#adding-new-features)

## Project Overview

The Gülbahçe Food Ordering Platform is a web application designed to facilitate food ordering for users in the Gülbahçe area. The platform consists of:

- User authentication system (login/signup)
- Address management
- Food menu browsing
- Shopping basket functionality
- Favorites management
- User profile management
- Business portal for restaurants

## Project Structure

The project follows a monorepo structure with separate packages for frontend and backend:

```
GY/
├── packages/
│   ├── frontend/
│   │   ├── public/
│   │   │   └── images/
│   │   └── src/
│   │       ├── assets/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── services/
│   │       ├── styles/
│   │       ├── utils/
│   │       ├── App.js
│   │       └── index.js
│   ├── backend/
│   │   └── ...
│   └── login-folder/
│       └── ...
└── package.json
```

### Key Directories

- **components/**: Reusable UI components (Header, AddressFormDialog, etc.)
- **pages/**: Full page components (Login, MyAddresses, Menu, etc.)
- **styles/**: CSS files for styling components
- **services/**: API service integrations
- **utils/**: Utility functions and helpers
- **assets/**: Static assets like images and icons

## Architecture

The application follows a component-based architecture using React. The main architectural patterns include:

### Routing System

The application uses React Router for navigation between different pages. Routes are defined in the `App.js` file:

```jsx
<Router>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route path="/menu" element={
      <Layout isAuthenticated={isAuthenticated}>
        <Menu />
      </Layout>
    } />
    {/* Other routes */}
  </Routes>
</Router>
```

### Layout Pattern

A Layout component wraps all authenticated pages, providing consistent header and styling:

```jsx
const Layout = ({ children, isAuthenticated }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  return (
    <Box sx={backgroundStyle}>
      {!isLoginPage && <Header />}
      <Box sx={{ pt: isLoginPage ? 0 : 2 }}>
        {children}
      </Box>
    </Box>
  );
};
```

### Component Hierarchy

- **App**: Main application container
  - **Layout**: Provides consistent layout structure
    - **Header**: Navigation and user menu
    - **Page Components**: Individual page content

## Design System

The application uses Material-UI (MUI) as its component library with a customized theme.

### Theme Configuration

The theme is defined in `App.js` with the following key aspects:

```jsx
const createAppTheme = (isLoggedIn) => {
  return createTheme({
    palette: {
      primary: {
        main: '#ff8800', // Orange
      },
      secondary: {
        main: '#9d8df1', // Purple
      },
      background: {
        default: isLoggedIn ? '#fef3e2' : '#ffffff', // Light yellow when logged in, white otherwise
      }
    },
  });
};
```

### Color Palette

- **Primary Color**: `#ff8800` (Orange)
- **Secondary Color**: `#9d8df1` (Purple)
- **Background Colors**:
  - Authenticated: `#fef3e2` (Light yellow)
  - Non-authenticated: `#ffffff` (White)
- **Error Color**: `#e74c3c` (Red)

### Typography

The application uses Material-UI's typography system with custom styling for specific components:

- Headings: Bold, often with primary or secondary colors
- Body text: Regular weight, using MUI's default font family

### Form Elements

Form inputs follow a consistent style:

```css
.input-field {
  width: 100%;
  padding: 15px 18px;
  border: 2px solid rgba(255, 136, 0, 0.3);
  border-radius: 12px;
  font-size: 1rem;
  background-color: white;
  transition: all 0.3s ease;
  margin: 0.5rem auto;
  box-sizing: border-box;
  display: block;
}
```

### Card Components

Cards are styled consistently with:
- Border radius: 8-12px
- Border: Often 2px solid primary color
- Box shadow: Light shadow for elevation

## Component Guidelines

### Creating New Components

When creating new components, follow these guidelines:

1. **Functional Components**: Use functional components with hooks
2. **Props Documentation**: Document props with JSDoc comments
3. **Consistent Styling**: Use Material-UI's `sx` prop for styling
4. **Component Structure**:
   ```jsx
   import React, { useState, useEffect } from 'react';
   import { /* MUI components */ } from '@mui/material';
   
   function ComponentName({ prop1, prop2 }) {
     // State hooks
     const [state, setState] = useState(initialValue);
     
     // Side effects
     useEffect(() => {
       // Effect logic
     }, [dependencies]);
     
     // Event handlers
     const handleEvent = () => {
       // Event handling logic
     };
     
     return (
       <Container>
         {/* Component JSX */}
       </Container>
     );
   }
   
   export default ComponentName;
   ```

### Reusable Dialog Pattern

For creating new dialogs, follow the pattern established in `AddressFormDialog.js`:

```jsx
function CustomDialog({ open, handleClose, data, handleSave, title }) {
  const [formData, setFormData] = useState(initialState);
  
  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      setFormData(initialState);
    }
  }, [data]);
  
  // Form handling logic
  
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* Form fields */}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
```

## State Management

The application uses React's built-in state management with hooks:

### Local Component State

For component-specific state, use `useState`:

```jsx
const [addresses, setAddresses] = useState([]);
const [loading, setLoading] = useState(true);
```

### Application State

For application-wide state like authentication, the app uses:

1. **localStorage** for persisting tokens and user data:
   ```jsx
   localStorage.setItem('token', response.data.token);
   localStorage.setItem('user', JSON.stringify(response.data.user));
   ```

2. **Context API** can be implemented for more complex state management needs

## API Integration

The application uses Axios for API calls:

```jsx
// Example API call
const fetchAddresses = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/addresses', {
      params: { userId: 'testuser' }
    });
    setAddresses(response.data);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    setError('Could not load addresses. Please try again later.');
  }
};
```

### API Service Pattern

For new features, create service modules in the `services/` directory:

```jsx
// services/addressService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

export const getAddresses = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/addresses`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAddress = async (addressData) => {
  try {
    const response = await axios.post(`${BASE_URL}/addresses`, addressData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

## Authentication Flow

The authentication flow is handled in the `Login.js` component:

1. **User Login/Signup**:
   - Form submission with validation
   - API call to authenticate
   - Token storage in localStorage
   - Redirect to main application

2. **Authentication Check**:
   - App.js checks for token on load
   - Sets authentication state accordingly
   - Updates theme based on authentication state

3. **Logout Process**:
   - Remove token and user data from localStorage
   - Update authentication state
   - Redirect to login page

## Development Guidelines

### Adding New Pages

To add a new page to the application:

1. Create a new component in the `pages/` directory
2. Add the route in `App.js`:
   ```jsx
   <Route path="/new-page" element={
     <Layout isAuthenticated={isAuthenticated}>
       <NewPage />
     </Layout>
   } />
   ```

### Adding New Components

To add a new reusable component:

1. Create the component in the `components/` directory
2. Follow the component structure guidelines
3. Import and use in page components as needed

### Styling Guidelines

1. Use Material-UI's `sx` prop for component-specific styling
2. For complex styling, create a CSS file in the `styles/` directory
3. Follow the established color palette and typography system
4. Use responsive design patterns:
   ```jsx
   <Grid container spacing={2}>
     <Grid item xs={12} md={6}>
       {/* Content */}
     </Grid>
   </Grid>
   ```

## Adding New Features

When adding new features to the application, follow these steps:

### 1. Plan the Feature

- Define the user stories and requirements
- Identify the components needed
- Plan the API endpoints required

### 2. Create Backend Endpoints

- Implement the necessary API endpoints in the backend
- Test the endpoints using Postman or similar tools

### 3. Create UI Components

- Build the required UI components following the component guidelines
- Ensure consistent styling with the design system

### 4. Implement API Integration

- Create service functions for API calls
- Implement error handling and loading states

### 5. Add Routing

- Update the routing configuration in App.js if needed
- Ensure proper navigation flow

### 6. Test the Feature

- Test all user flows and edge cases
- Ensure responsive design works on all screen sizes

### Example: Adding a New Feature

For example, to add a "Restaurant Details" feature:

1. Create a `RestaurantDetails.js` page component
2. Create any needed reusable components like `MenuItemCard.js`
3. Implement API services in `services/restaurantService.js`
4. Add the route in `App.js`
5. Implement navigation from the menu page

```jsx
// pages/RestaurantDetails.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getRestaurantDetails } from '../services/restaurantService';
import MenuItemCard from '../components/MenuItemCard';

function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getRestaurantDetails(id);
        setRestaurant(data);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [id]);
  
  // Component implementation
}

export default RestaurantDetails;
```

By following these guidelines, new features can be seamlessly integrated into the existing architecture while maintaining consistency in design and functionality.

### Favoriler (Favorites) Özelliği

- **Backend**
  - `Favorite` tablosu: userId, menuItemId
  - API endpoint'leri:
    - `POST /api/favorites` (body: menuItemId) → Favori ekle
    - `DELETE /api/favorites/:menuItemId` → Favori sil
    - `GET /api/favorites` → Kullanıcının favori menü item'larını getirir
- **Frontend**
  - Menü kartlarında kalp ikonuna tıklayınca favori ekler/siler.
  - Favorilerim sayfası (`/favorites`): Kullanıcının favori menü item'larını kart olarak gösterir.
  - Favori durumu, login olan kullanıcıya göre backend'den alınır ve güncellenir.
