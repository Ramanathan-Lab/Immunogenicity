import React, { useState, useEffect, useCallback} from 'react';
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
  CircularProgress
} from '@mui/material';
import axios from 'axios';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

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
      data.map((row, index) => (
        <Card key={index} sx={{ marginBottom: 2 }}>
          <CardContent>
            {Object.keys(row).map((key) => (
              <Typography key={key}>
                <strong>{key}</strong>: {row[key] ? row[key].toString() : "N/A"}
              </Typography>
            ))}
            <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
              <Button variant="contained" onClick={() => handleDownloadClick(row)}>
                Download
              </Button>
              <Button variant="contained" onClick={() => handleDetailsClick(row, section)}>
                Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))
    ) : (
      <Typography>No results found</Typography>
    );
  };

  return (
    <div>
      <Box sx={{ backgroundColor: '#d5dff2', minHeight: '100vh' }}>
        <Navbar />

        <Box sx={{ display: 'flex', marginTop: 2 }}>
          <Box sx={{ width: '25%', padding: 2 }}>
            <Card>
              <CardContent>
                <SearchForm initialFilters={filters} initialOrder={fieldsOrder} onSearch={handleSearch} />
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ width: '75%', padding: 2 }}>
            <Card>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Therapeutic" />
                <Tab label="Immunogenicity" />
                <Tab label="Product" />
                <Tab label="Package" />
              </Tabs>

              <Box sx={{ padding: 2 }}>
                <Button variant="outlined" onClick={handleDownloadAllExcel} sx={{ marginBottom: 2 }}>
                  Download All in Excel
                </Button>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {activeTab === 0 && <div>{renderResultCards(therapeuticResults, 'therapeutic')}</div>}
                    {activeTab === 1 && <div>{renderResultCards(immunogenicityResults, 'immunogenicity')}</div>}
                    {activeTab === 2 && <div>{renderResultCards(productResults, 'product')}</div>}
                    {activeTab === 3 && <div>{renderResultCards(packageResults, 'package')}</div>}
                  </>
                )}

              </Box>
            </Card>
          </Box>
        </Box>

        <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)}>
          <DialogTitle>Choose Download Format</DialogTitle>
          <DialogContent>
            <Typography>Select CSV or JSON for this record.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleDownloadFormat('csv')}>CSV</Button>
            <Button onClick={() => handleDownloadFormat('json')}>JSON</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}
