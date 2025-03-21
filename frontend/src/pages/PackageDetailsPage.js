import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Box, Card, CardContent, Button, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

export default function PackageDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = location.state?.filters || {};
  const fieldsOrder = location.state?.fieldsOrder || [];
  const savedResults = location.state?.savedResults || {};

  const ndcpackagecode = location.state?.record?.ndcpackagecode;

  useEffect(() => {
    if (!ndcpackagecode) {
      setError("No record selected.");
      setLoading(false);
      return;
    }
    fetchRecordDetails();
  }, [ndcpackagecode]);

  const fetchRecordDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/get-details`, {
        params: { ndcpackagecode }
      });
      setRecord(response.data.package || {});
    } catch (err) {
      console.error("Error fetching details:", err.response?.data || err.message);
      setError("Failed to load record details.");
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
        <Card sx={{ width: '60%', padding: 3 }}>
          <CardContent>
            <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 2 }}>
              Package Details
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography sx={{ textAlign: 'center', color: 'red' }}>{error}</Typography>
            ) : record && Object.keys(record).length > 0 ? (
              Object.keys(record).map((key) => (
                <Typography key={key} sx={{ textAlign: 'left', marginBottom: 1 }}>
                  <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {record[key] ? record[key].toString() : "N/A"}
                </Typography>
              ))
            ) : (
              <Typography sx={{ textAlign: 'center' }}>No package details available.</Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <Button variant="contained" onClick={() => navigate('/results', { state: { filters, fieldsOrder, savedResults } })}>
                Back to Results
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}
