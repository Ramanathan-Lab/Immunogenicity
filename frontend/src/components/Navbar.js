import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = (
    <>
      <Button 
        color="inherit" 
        component={Link} 
        to="/"
        sx={{
          mx: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease'
        }}
      >
        Home
      </Button>
      <Button 
        color="inherit" 
        component={Link} 
        to="/info"
        sx={{
          mx: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease'
        }}
      >
        Info
      </Button>
    </>
  );

  const drawer = (
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: '#0D3B66',
          color: 'white',
          width: 240
        }
      }}
    >
      <List>
        <ListItem 
          component={Link} 
          to="/" 
          onClick={handleDrawerToggle}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Home
        </ListItem>
        <ListItem 
          component={Link} 
          to="/info" 
          onClick={handleDrawerToggle}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Info
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: '#0D3B66',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
        py: 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <img 
          src="/logo.png"       
          alt="Logo"
          style={{ 
            width: '240px', 
            height: '30px',
            borderRadius: '4px',
            padding: '4px',
            transition: 'all 0.3s ease'
          }}
        />

        {isMobile ? (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {navItems}
          </div>
        )}
      </Toolbar>
      {drawer}
    </AppBar>
  );
}
