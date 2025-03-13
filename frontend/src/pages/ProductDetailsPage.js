import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Box, Card, CardContent, Button, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';

export default function ProductDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = location.state?.filters || {};
  const fieldsOrder = location.state?.fieldsOrder || [];
  const savedResults = location.state?.savedResults || {};

  const productid = location.state?.record?.productid;

  useEffect(() => {
    if (!productid) {
      setError("No record selected.");
      setLoading(false);
      return;
    }
    fetchRecordDetails();
  }, [productid]);

  const fetchRecordDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/get-details`, {
        params: { productid }
      });

      setRecord(response.data.product || {});
    } catch (err) {
      console.error("Error fetching details:", err.response?.data || err.message);
      setError("Failed to load product details.");
    }
    setLoading(false);
  };

  
  const parsePharmClasses = (pharm_classes) => {
    if (!pharm_classes || pharm_classes === "N/A") return null;

    let epcValues = [];
    let csValues = [];
    let moaValues = [];

    pharm_classes.split(", ").forEach((entry) => {
      if (entry.includes("[EPC]")) epcValues.push(entry.replace(" [EPC]", ""));
      if (entry.includes("[CS]")) csValues.push(entry.replace(" [CS]", ""));
      if (entry.includes("[MoA]")) moaValues.push(entry.replace(" [MoA]", ""));
    });

    const maxRows = Math.max(epcValues.length, csValues.length, moaValues.length);

    return (
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>EPC</strong></TableCell>
              <TableCell><strong>CS</strong></TableCell>
              <TableCell><strong>MoA</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(maxRows)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>{epcValues[index] || "—"}</TableCell>
                <TableCell>{csValues[index] || "—"}</TableCell>
                <TableCell>{moaValues[index] || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div>
      <Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
        <Card sx={{ width: '60%', padding: 3 }}>
          <CardContent>
            <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 2 }}>
              Product Details
            </Typography>

            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="red" sx={{ textAlign: 'center' }}>{error}</Typography>
            ) : record && Object.keys(record).length > 0 ? (
              <>
                {Object.keys(record).map((key) => 
                  key !== "pharm_classes" && ( 
                    <Typography key={key} sx={{ textAlign: 'left', marginBottom: 1 }}>
                      <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {record[key] ? record[key].toString() : "N/A"}
                    </Typography>
                  )
                )}

                {}
                {record.pharm_classes && record.pharm_classes !== "N/A" && (
                  <>
                    <Typography variant="h6" sx={{ textAlign: 'left', marginTop: 2 }}>
                      Pharmacological Classes:
                    </Typography>
                    {parsePharmClasses(record.pharm_classes)}
                  </>
                )}
              </>
            ) : (
              <Typography sx={{ textAlign: 'center' }}>No product details available.</Typography>
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
