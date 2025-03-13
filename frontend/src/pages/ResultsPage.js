import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchForm from '../components/SearchForm';
import {
  Box,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  useMediaQuery,
  LinearProgress,
  Fade,
  Divider
} from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  },
  marginBottom: theme.spacing(2),
  borderRadius: '12px'
}));

const ResultTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: '#0D3B66',
    height: 3
  }
});

const ResultTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  minWidth: '120px',
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    fontSize: '0.875rem'
  }
}));

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');


  const {filters: initialFilters = {}, fieldsOrder: initialOrder = [], savedResults = null } = location.state || {};
  const [filters, setFilters] = useState(initialFilters);
  const [fieldsOrder, setFieldsOrder] = useState(initialOrder.length ? initialOrder : Object.keys(initialFilters));
  const [activeTab, setActiveTab] = useState(0);

  const [productResults, setProductResults] = useState(savedResults?.productResults || []);
  const [packageResults, setPackageResults] = useState(savedResults?.packageResults || []);
  const [therapeuticResults, setTherapeuticResults] = useState(savedResults?.therapeuticResults || []);
  const [immunogenicityResults, setImmunogenicityResults] = useState(savedResults?.immunogenicityResults || []);
  const [loading, setLoading] = useState(!savedResults);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedCardData, setSelectedCardData] = useState(null);

  

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/search-main', { filters, fieldsOrder });

      if (response.data) {
        setProductResults(response.data.productResults || []);
        setPackageResults(response.data.packageResults || []);
        setTherapeuticResults(response.data.therapeuticResults || []);
        setImmunogenicityResults(response.data.immunogenicityResults || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [filters, fieldsOrder]); 

  useEffect(() => {
    if (!savedResults) {
      fetchResults();
    }
  }, [fetchResults, savedResults]);

  const handleSearch = (newFilters, newOrder) => {
    setFilters(newFilters);
    setFieldsOrder(newOrder);
    setProductResults([]); // Clear results before new search
  setPackageResults([]);
  setTherapeuticResults([]);
  setImmunogenicityResults([]);
  setLoading(true);

  axios.post('http://localhost:5000/api/search-main', { filters: newFilters, fieldsOrder: newOrder })
    .then(response => {
      setProductResults(response.data.productResults || []);
      setPackageResults(response.data.packageResults || []);
      setTherapeuticResults(response.data.therapeuticResults || []);
      setImmunogenicityResults(response.data.immunogenicityResults || []);
    })
    .catch(error => console.error(error))
    .finally(() => setLoading(false));
  };

  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDetailsClick = (row, section) => {
    const detailsPageRoute = {
      therapeutic: '/therapeutic-details',
      immunogenicity: '/immunogenicity-details',
      product: '/product-details',
      package: '/package-details'
    }[section];
  
    navigate(detailsPageRoute, {
      state: {
        record: { productid: row.productid, ndcpackagecode: row.ndcpackagecode },
        filters,
        fieldsOrder,
        savedResults: {
          productResults,
          packageResults,
          therapeuticResults,
          immunogenicityResults
        }
      }
    });
  };
  
  const handleDownloadClick = (rowData) => {
    setSelectedCardData(rowData);
    setDownloadDialogOpen(true);
  };

  const handleDownloadFormat = async (format) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/download',
        { data: [selectedCardData], format },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data.${format === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
    setDownloadDialogOpen(false);
  };

  const handleDownloadAllExcel = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/download-all-excel', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'main.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const renderResultCards = (data = [], section) => {
    return data.length > 0 ? (
      <Grid container spacing={2}>
        {data.map((row, index) => (
          <Grid item xs={12} key={index}>
            <StyledCard>
              <CardContent>
                <Grid container spacing={1}>
                  {Object.keys(row).map((key) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Typography variant="body2">
                        <Box component="span" fontWeight="600" >
                        <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong>
                        </Box>{' '}
                        {row[key] ? row[key].toString() : "N/A"}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadClick(row)}
                    sx={{
                      background: 'linear-gradient(135deg, #0D3B66 0%, #1a5a8d 100%)',
                      borderRadius: '8px',
                      textTransform: 'none'
                    }}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<InfoIcon />}
                    onClick={() => handleDetailsClick(row, section)}
                    sx={{
                      borderColor: '#0D3B66',
                      color: '#0D3B66',
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(13, 59, 102, 0.08)'
                      }
                    }}
                  >
                    Details
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    ) : (
      <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
        No results found
      </Typography>
    );
  };

  return (
    <Box sx={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        p: 2,
        gap: 2
      }}>
        {/* Search Form Sidebar */}
        <Box sx={{ 
          width: { xs: '100%', md: '300px' }, 
          flexShrink: 0 
        }}>
          <Card sx={{ 
            borderRadius: '12px', 
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Refine Search
              </Typography>
              <SearchForm 
                initialFilters={filters} 
                initialOrder={fieldsOrder} 
                onSearch={handleSearch} 
              />
            </CardContent>
          </Card>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1 }}>
          <Card sx={{ 
            borderRadius: '12px', 
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)'
          }}>
            <ResultTabs value={activeTab} onChange={handleTabChange} variant="scrollable">
              <ResultTab label="Therapeutic" />
              <ResultTab label="Immunogenicity" />
              <ResultTab label="Product" />
              <ResultTab label="Package" />
            </ResultTabs>

            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3 
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {['Therapeutic', 'Immunogenicity', 'Product', 'Package'][activeTab]} Results
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleDownloadAllExcel}
                  startIcon={<DownloadIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #0D3B66 0%, #1a5a8d 100%)',
                    borderRadius: '8px',
                    textTransform: 'none'
                  }}
                >
                  Export All
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  py: 6 
                }}>
                  <CircularProgress size={60} thickness={4} sx={{ color: '#0D3B66' }} />
                </Box>
              ) : (
                <>
                  {activeTab === 0 && renderResultCards(therapeuticResults, 'therapeutic')}
                  {activeTab === 1 && renderResultCards(immunogenicityResults, 'immunogenicity')}
                  {activeTab === 2 && renderResultCards(productResults, 'product')}
                  {activeTab === 3 && renderResultCards(packageResults, 'package')}
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Download Dialog */}
      <Dialog 
        open={downloadDialogOpen} 
        onClose={() => setDownloadDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Download Format</DialogTitle>
        <DialogContent>
          <Typography>Select your preferred download format:</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => handleDownloadFormat('csv')}
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              borderColor: '#0D3B66',
              color: '#0D3B66',
              '&:hover': { backgroundColor: 'rgba(13, 59, 102, 0.08)' }
            }}
          >
            CSV
          </Button>
          <Button 
            onClick={() => handleDownloadFormat('json')}
            variant="contained"
            sx={{ 
              background: '#0D3B66',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#1a5a8d' }
            }}
          >
            JSON
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
