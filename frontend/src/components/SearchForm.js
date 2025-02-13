import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Stack,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';

export default function SearchForm({ initialFilters, initialOrder, onSearch }) {
  const [filters, setFilters] = useState(initialFilters);
  const [fieldsOrder, setFieldsOrder] = useState(initialOrder || Object.keys(initialFilters));

  // Suggestions state for each field
  const [suggestions, setSuggestions] = useState({
    productid: [],
    ndcpackagecode: [],
    unii: [],
    proprietaryname: [],
    nonproprietaryname: [],
  });

  useEffect(() => {
    setFilters(initialFilters || {});
    setFieldsOrder(initialOrder.length ? initialOrder : Object.keys(initialFilters || {}));
  }, [initialFilters, initialOrder]);

  // Fetch suggestions dynamically when user types
  const fetchSuggestions = async (field, query) => {
    if (!query) {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/suggestions?field=${field}&query=${query}`);
      setSuggestions((prev) => ({ ...prev, [field]: res.data || [] }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleValueChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: { ...prev[field], value: value || '' },
    }));
  };

  const handleInputChange = (field, newInputValue) => {
    handleValueChange(field, newInputValue);

    // Fetch dynamic suggestions when user types
    if (newInputValue.length > 1) {
      fetchSuggestions(field, newInputValue);
    } else {
      setSuggestions((prev) => ({ ...prev, [field]: [] })); 
    }
  };

  const handleOperatorChange = (field, operator) => {
    setFilters((prev) => ({
      ...prev,
      [field]: { ...prev[field], operator },
    }));
  };

  const handleReorder = (index, direction) => {
    const newOrder = [...fieldsOrder];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setFieldsOrder(newOrder);
  };

  const handleSubmit = () => {
    if (onSearch) {
      onSearch(filters, fieldsOrder);
    }
  };

  const renderField = (label, fieldKey, index) => (
    <Stack direction="row" spacing={1} alignItems="center" mb={1} key={fieldKey}>
      {/* Autocomplete Input */}
      <Box sx={{ flexGrow: 1 }}>
        <Autocomplete
          freeSolo
          options={suggestions[fieldKey]}
          value={filters[fieldKey].value}
          inputValue={filters[fieldKey].value}
          onChange={(event, newValue) => handleValueChange(fieldKey, newValue)}
          onInputChange={(event, newInputValue) => handleInputChange(fieldKey, newInputValue)}
          renderInput={(params) => (
            <TextField {...params} label={label} variant="outlined" fullWidth size="small" />
          )}
          sx={{ width: '100%' }}
        />
      </Box>

      {/* AND/OR Buttons (Only for fields after the first one) */}
      {index > 0 && (
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Button
            size="small"
            variant={filters[fieldKey].operator === 'AND' ? 'contained' : 'outlined'}
            onClick={() => handleOperatorChange(fieldKey, 'AND')}
          >
            AND
          </Button>
          <Button
            size="small"
            variant={filters[fieldKey].operator === 'OR' ? 'contained' : 'outlined'}
            onClick={() => handleOperatorChange(fieldKey, 'OR')}
          >
            OR
          </Button>
        </Stack>
      )}

      {/* Reordering Buttons */}
      <Stack direction="column" spacing={0.5} sx={{ flexShrink: 0 }}>
        {index > 0 && (
          <IconButton onClick={() => handleReorder(index, 'up')} size="small">
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
        )}
        {index < fieldsOrder.length - 1 && (
          <IconButton onClick={() => handleReorder(index, 'down')} size="small">
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Search Form
      </Typography>

      {fieldsOrder.map((fieldKey, index) =>
        renderField(
          {
            productid: 'ProductId',
            ndcpackagecode: 'NdcPackageCode',
            unii: 'UNII',
            proprietaryname: 'Proprietary Name',
            nonproprietaryname: 'Non-Proprietary Name',
          }[fieldKey],
          fieldKey,
          index
        )
      )}

      <Button variant="contained" onClick={handleSubmit} sx={{ marginTop: 1, width: '100%' }} size="small">
        Search
      </Button>
    </>
  );
}
