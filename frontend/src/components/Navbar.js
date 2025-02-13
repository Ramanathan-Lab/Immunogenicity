import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#0D3B66' }}>
      <Toolbar>
        {}
        <img 
          src="/logo.png"       
          alt="Logo"
          style={{ width: 240, height: 30, marginRight: '0.5rem', backgroundColor: 'white' }}
        />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {}
          <span style={{ marginRight: '1rem' }}></span>
          {}
        </Typography>

        {}
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/info">
          Info
        </Button>
      </Toolbar>
    </AppBar>
  );
}
