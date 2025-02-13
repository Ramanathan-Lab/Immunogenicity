import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';

export default function HomePage() {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    productid: { value: '', operator: 'AND' },
    ndcpackagecode: { value: '', operator: 'AND' },
    unii: { value: '', operator: 'AND' },
    proprietaryname: { value: '', operator: 'AND' },
    nonproprietaryname: { value: '', operator: 'AND' },
  });

  // Suggestions state for each field.
  const [productidSuggestions, setProductidSuggestions] = useState([]);
  const [ndcpackagecodeSuggestions, setNdcpackagecodeSuggestions] = useState([]);
  const [uniiSuggestions, setUniiSuggestions] = useState([]);
  const [proprietarynameSuggestions, setProprietarynameSuggestions] = useState([]);
  const [nonproprietarynameSuggestions, setNonproprietarynameSuggestions] = useState([]);

  // Mapping suggestion setter functions.
  const suggestionSetters = {
    productid: setProductidSuggestions,
    ndcpackagecode: setNdcpackagecodeSuggestions,
    unii: setUniiSuggestions,
    proprietaryname: setProprietarynameSuggestions,
    nonproprietaryname: setNonproprietarynameSuggestions,
  };

  // New state for ordering the fields.
  const [fieldsOrder, setFieldsOrder] = useState([
    'productid',
    'ndcpackagecode',
    'unii',
    'proprietaryname',
    'nonproprietaryname',
  ]);

  // Mapping of field keys to labels.
  const labels = {
    productid: 'ProductId',
    ndcpackagecode: 'NdcPackageCode',
    unii: 'UNII',
    proprietaryname: 'Proprietary Name',
    nonproprietaryname: 'Non-Proprietary Name',
  };

  // Mapping of field keys to suggestions.
  const suggestionsMapping = {
    productid: productidSuggestions,
    ndcpackagecode: ndcpackagecodeSuggestions,
    unii: uniiSuggestions,
    proprietaryname: proprietarynameSuggestions,
    nonproprietaryname: nonproprietarynameSuggestions,
  };

  // Fetch suggestions from the backend.
  const fetchSuggestions = async (field, setterFn, query = '') => {
    if (!query) return setterFn([]); 
    try {
      const res = await axios.get(
        `http://localhost:5000/api/suggestions?field=${field}&query=${query}`
      );
      setterFn(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Update filter value for a given field.
  const handleValueChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        value: value || '',
      },
    }));
  };

  // Update the operator (AND/OR) for a given field.
  const handleOperatorChange = (field, operator) => {
    setFilters((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        operator,
      },
    }));
  };

  // Reordering functions: move a field up or down.
  const moveFieldUp = (index) => {
    if (index === 0) return;
    const newOrder = [...fieldsOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setFieldsOrder(newOrder);
  };

  const moveFieldDown = (index) => {
    if (index === fieldsOrder.length - 1) return;
    const newOrder = [...fieldsOrder];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setFieldsOrder(newOrder);
  };

  // Perform search: send filters and the order to the backend.
  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/search-main', { filters, fieldsOrder });
      const mainResults = response.data;
      navigate('/results', { state: { mainResults, filters } });
    } catch (err) {
      console.error(err);
    }
  };

  // Render a field row.
  const renderField = (label, fieldKey, suggestions, index) => (
    <Stack direction="row" spacing={1} alignItems="center" mb={2} sx={{ width: '100%' }}>
      {}
      <Box sx={{ flexGrow: 1 }}>
        <Autocomplete
          freeSolo
          options={suggestions}
          filterOptions={(options) => options}
          value={filters[fieldKey].value}
          inputValue={filters[fieldKey].value}
          onChange={(event, newValue) => {
            handleValueChange(fieldKey, newValue);
          }}
          onInputChange={(event, newInputValue) => {
            handleValueChange(fieldKey, newInputValue);
            if (newInputValue.length > 1) {
              fetchSuggestions(fieldKey, suggestionSetters[fieldKey], newInputValue);
            } else {
              suggestionSetters[fieldKey]([]);
            }
          }}
          renderInput={(params) => <TextField {...params} label={label} variant="outlined" fullWidth />}
          sx={{ width: '100%' }} // Ensure Autocomplete uses full width
        />
      </Box>
      {}
      {index > 0 && (
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            variant={filters[fieldKey].operator === 'AND' ? 'contained' : 'outlined'}
            onClick={() => handleOperatorChange(fieldKey, 'AND')}
          >
            AND
          </Button>
          <Button
            variant={filters[fieldKey].operator === 'OR' ? 'contained' : 'outlined'}
            onClick={() => handleOperatorChange(fieldKey, 'OR')}
          >
            OR
          </Button>
        </Stack>
      )}
    </Stack>
  );

  return (
    <div>
      <Box sx={{ backgroundColor: '#d5dff2', minHeight: '100vh' }}>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <Card sx={{ width: '90%', maxWidth: 500, padding: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search Form
              </Typography>
              {}
              {fieldsOrder.map((fieldKey, index) => (
                <Box key={fieldKey} sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                  {renderField(labels[fieldKey], fieldKey, suggestionsMapping[fieldKey], index)}
                  {}
                  {fieldsOrder.length > 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
                      {index > 0 && (
                        <IconButton onClick={() => moveFieldUp(index)}>
                          <ArrowUpwardIcon />
                        </IconButton>
                      )}
                      {index < fieldsOrder.length - 1 && (
                        <IconButton onClick={() => moveFieldDown(index)}>
                          <ArrowDownwardIcon />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
              <Button variant="contained" onClick={handleSearch} sx={{ marginTop: 2, width: '100%' }}>
                Search
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </div>
  );
}
