import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Stack,
  IconButton,
  Box,
  Typography,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-1px)'
  }
}));

const OperatorButton = styled(Button)(({ theme, active }) => ({
  minWidth: '64px',
  borderRadius: '6px',
  fontWeight: 600,
  border: active ? '2px solid transparent' : `2px solid ${theme.palette.primary.main}`,
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? '#fff' : theme.palette.primary.main,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : 'rgba(13, 59, 102, 0.08)'
  }
}));

export default function SearchForm({ initialFilters, initialOrder, onSearch }) {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
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
      setLoadingSuggestions(true);
      const res = await axios.get(`http://localhost:5000/api/suggestions?field=${field}&query=${query}`);
      setSuggestions((prev) => ({ ...prev, [field]: res.data || [] }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSuggestions(false);
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
    <Stack 
      direction={isMobile ? 'column' : 'row'} 
      spacing={1} 
      alignItems="center" 
      mb={2} 
      key={fieldKey}
      sx={{ width: '100%' }}
    >
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Autocomplete
          freeSolo
          options={suggestions[fieldKey]}
          loading={loadingSuggestions}
          value={filters[fieldKey].value}
          inputValue={filters[fieldKey].value}
          onChange={(event, newValue) => handleValueChange(fieldKey, newValue)}
          onInputChange={(event, newInputValue) => handleInputChange(fieldKey, newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              variant="filled"
              fullWidth
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
                sx: {
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                  transition: 'all 0.3s ease'
                }
              }}
            />
          )}
          sx={{
            '& .MuiAutocomplete-popupIndicator': { borderRadius: '50%' },
            '& .MuiAutocomplete-clearIndicator': { borderRadius: '50%' }
          }}
        />
      </Box>

      <Stack 
        direction={isMobile ? 'row' : 'column'} 
        spacing={1} 
        sx={{ 
          flexShrink: 0,
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-start'
        }}
      >
        {index > 0 && (
          <Stack direction="row" spacing={1}>
            <OperatorButton
              size="small"
              active={filters[fieldKey].operator === 'AND'}
              onClick={() => handleOperatorChange(fieldKey, 'AND')}
            >
              AND
            </OperatorButton>
            <OperatorButton
              size="small"
              active={filters[fieldKey].operator === 'OR'}
              onClick={() => handleOperatorChange(fieldKey, 'OR')}
            >
              OR
            </OperatorButton>
          </Stack>
        )}

        <Stack direction="row" spacing={1}>
          {index > 0 && (
            <IconButton 
              onClick={() => handleReorder(index, 'up')} 
              size="small"
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': { 
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          )}
          {index < fieldsOrder.length - 1 && (
            <IconButton 
              onClick={() => handleReorder(index, 'down')} 
              size="small"
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': { 
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ p: 1 }}>
      

      {fieldsOrder.map((fieldKey, index) =>
        renderField(
          {
            productid: 'Product ID',
            ndcpackagecode: 'NDC Package Code',
            unii: 'UNII',
            proprietaryname: 'Proprietary Name',
            nonproprietaryname: 'Non-Proprietary Name',
          }[fieldKey],
          fieldKey,
          index
        )
      )}

      <StyledButton
        variant="contained"
        onClick={handleSubmit}
        fullWidth
        sx={{
          py: 1.5,
          fontWeight: 600,
          background: 'linear-gradient(135deg, #0D3B66 0%, #1a5a8d 100%)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(13, 59, 102, 0.3)'
          }
        }}
      >
        Apply Filters
      </StyledButton>
    </Box>
  );
}
