import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Typography, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableRow,
  TableContainer, 
  Paper, 
  Tabs, 
  Tab 
} from '@mui/material';
import axios from 'axios';

const SECTIONS = {
  Approval: [
    't_id', 'audit_status', 'inn_name', 'furthest_development_stage_reached',
    'fda_approved', 'first_fda_approval', 'eu_approval', 'first_eu_approval',
    'productid', 'ndcpackagecode', 'marketing_category', 'application_number',
    'proprietaryname', 'generic_proper_name', 'spl_effective_date',
    'established_pharmacologic_class', 'initia_us_approval', 'company',
    'marketing_date', 'ndc', 'active_ingredient_unii', 'active_moiety_unii'
  ],
  Manufacture: [
    'manufacturer', 'labelled_as_biosimilar', 'conjugated', 'drug_modifications',
    'expression_system', 'labeling_type', 'dosage_form', 'route_of_administration',
    'active_ingredients', 'active_moiety_names'
  ],
  Sequence: [
    'protein_idc_database_identifier', 'protein_description', 'protein_modality',
    'species', 'backbone', 'light_chain', 'fc_modifications',
    'sequence_idc_database_identifier', 'sequence_verified',
    'target_protein_molecule', 'target_uniprot_id', 'moa', 'progeny_of_prot_id'
  ]
};

export default function TherapeuticDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [combinedData, setCombinedData] = useState({ Approval: {}, Manufacture: {}, Sequence: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const productid = location.state?.record?.productid;
  const ndcpackagecode = location.state?.record?.ndcpackagecode;

  const processData = (therapeuticData, blaData) => {
    const processed = { Approval: {}, Manufacture: {}, Sequence: {} };

    // Process therapeutic data
    Object.entries(therapeuticData).forEach(([key, value]) => {
      Object.keys(SECTIONS).forEach(section => {
        if (SECTIONS[section].includes(key)) {
          processed[section][key] = [value?.toString() || 'N/A'];
        }
      });
    });

    // Process bla data
    blaData.forEach(record => {
      Object.keys(SECTIONS).forEach(section => {
        SECTIONS[section].forEach(key => {
          const recordValue = record[key]?.toString().toLowerCase() || 'N/A';
          if (recordValue && recordValue !== 'N/A') {
            if (!processed[section][key]) {
              processed[section][key] = [];
            }
            if (!processed[section][key].includes(recordValue)) {
              processed[section][key].push(recordValue);
            }
          }
        });
      });
    });

    return processed;
  };

  const fetchRecordDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/get-details`, {
        params: { productid, ndcpackagecode }
      });

      const therapeuticData = response.data.therapeutic || {};
      const blaData = response.data.bla || [];
      
      setCombinedData(processData(therapeuticData, blaData));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching details:", err);
      setError("Failed to load record details.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productid && !ndcpackagecode) {
      setError("No record selected.");
      setLoading(false);
      return;
    }
    fetchRecordDetails();
  }, [productid, ndcpackagecode]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderSectionTable = (section) => (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table size="small">
        <TableBody>
          {SECTIONS[section].map((field) => (
            combinedData[section][field] && (
              <TableRow key={field}>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  backgroundColor: '#f5f5f5',
                  width: '35%'
                }}>
                  {field.replace(/_/g, ' ').toUpperCase()}
                </TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>
                  {combinedData[section][field].join(', ')}
                </TableCell>
              </TableRow>
            )
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div>
      <Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Card sx={{ width: '90%', maxWidth: 1200, p: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Therapeutic Details
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" align="center">{error}</Typography>
            ) : (
              <>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ mb: 3 }}
                >
                  <Tab label="Manufacture" />
                  <Tab label="Sequence" />
                  <Tab label="Approval" />
                </Tabs>

                {activeTab === 0 && renderSectionTable('Manufacture')}
                {activeTab === 1 && renderSectionTable('Sequence')}
                {activeTab === 2 && renderSectionTable('Approval')}

                <Box display="flex" justifyContent="center" mt={4}>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate(-1)}
                    sx={{ minWidth: 120 }}
                  >
                    Back
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}
