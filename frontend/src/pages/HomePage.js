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
  useMediaQuery,
  LinearProgress,
  Fade,
  Divider
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';

export default function HomePage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [loading, setLoading] = useState(false);

  // Filters state for each field.
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

  // NEW: State for ordering the fields.
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
    if (!query) return setterFn([]); // Reset suggestions when input is empty

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
    <Stack direction={isMobile ? 'column' : 'row'} spacing={1} alignItems="center" mb={2} sx={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Autocomplete
          freeSolo
          options={suggestions}
          filterOptions={(options) => options}
          value={filters[fieldKey].value}
          inputValue={filters[fieldKey].value}
          loading={loading}
          onChange={(event, newValue) => handleValueChange(fieldKey, newValue)}
          onInputChange={(event, newInputValue) => {
            handleValueChange(fieldKey, newInputValue);
            if (newInputValue.length > 1) {
              setLoading(true);
              fetchSuggestions(fieldKey, suggestionSetters[fieldKey], newInputValue)
                .finally(() => setLoading(false));
            } else {
              suggestionSetters[fieldKey]([]);
            }
          }}
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
                  borderRadius: 2,
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

      {index > 0 && (
        <Stack direction="row" spacing={1} sx={{ 
          flexShrink: 0, 
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}>
          <Button
            variant={filters[fieldKey].operator === 'AND' ? 'contained' : 'outlined'}
            onClick={() => handleOperatorChange(fieldKey, 'AND')}
            sx={{
              minWidth: 80,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: filters[fieldKey].operator === 'AND' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            AND
          </Button>
          <Button
            variant={filters[fieldKey].operator === 'OR' ? 'contained' : 'outlined'}
            onClick={() => handleOperatorChange(fieldKey, 'OR')}
            sx={{
              minWidth: 80,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: filters[fieldKey].operator === 'OR' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            OR
          </Button>
        </Stack>
      )}
    </Stack>
  );

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8f9fd 0%, #e9ecef 100%)',
      minHeight: '100vh',
    }}>
      <Navbar />
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        px: 2,
        pt: { xs: 2, sm: 4 },
        pb: 4
      }}>
        <Card sx={{ 
          width: '90%',
          maxWidth: 600,
          borderRadius: 4,
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
          mt: { xs: 2, sm: 4 },
          position: 'relative'
        }}>
          <Fade in={loading}>
            <LinearProgress sx={{ 
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4
            }} />
          </Fade>
          
          <CardContent sx={{ px: { xs: 2, sm: 4 }, py: 4 }}>
            <Typography variant="h5" component="div" sx={{ 
              mb: 3,
              fontWeight: 700,
              color: 'text.primary',
              textAlign: 'center',
              position: 'relative',
              top: -8
            }}>
              Advanced Search
              <Divider sx={{ 
                mt: 2,
                mx: 'auto',
                width: 60,
                height: 3,
                backgroundColor: 'primary.main'
              }} />
            </Typography>

            {fieldsOrder.map((fieldKey, index) => (
              <Box key={fieldKey} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%', 
                mb: 2,
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <Box sx={{ 
                  width: '100%', 
                  mr: isMobile ? 0 : 2,
                }}>
                  {renderField(labels[fieldKey], fieldKey, suggestionsMapping[fieldKey], index)}
                </Box>

                {fieldsOrder.length > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'row' : 'column', 
                    ml: isMobile ? 0 : 1,
                    mt: isMobile ? 1 : 0
                  }}>
                    {index > 0 && (
                      <IconButton 
                        onClick={() => moveFieldUp(index)}
                        sx={{
                          backgroundColor: 'background.paper',
                          boxShadow: 1,
                          '&:hover': { 
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText'
                          }
                        }}
                      >
                        <ArrowUpwardIcon fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )}
                    {index < fieldsOrder.length - 1 && (
                      <IconButton 
                        onClick={() => moveFieldDown(index)}
                        sx={{
                          backgroundColor: 'background.paper',
                          boxShadow: 1,
                          ml: isMobile ? 1 : 0,
                          mt: isMobile ? 0 : 1,
                          '&:hover': { 
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText'
                          }
                        }}
                      >
                        <ArrowDownwardIcon fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )}
                  </Box>
                )}
              </Box>
            ))}

            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              sx={{
                mt: 2,
                width: '100%',
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 15,
                background: 'linear-gradient(135deg, #0D3B66 0%, #1a5a8d 100%)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(13, 59, 102, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Search Now
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
