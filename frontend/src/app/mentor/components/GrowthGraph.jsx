import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Slider,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Button,
  IconButton,
  Stack,
  InputAdornment,
  useTheme
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';

/**
 * GrowthGraph component for visualizing and editing growth data
 * 
 * @param {Object} data - Growth data with structure as defined
 * @param {Function} onChange - Callback when data changes
 * @param {Boolean} disabled - If true, editing is disabled
 */
const GrowthGraph = ({ data, onChange, disabled = false }) => {
  const theme = useTheme();
  
  // State for edited data
  const [editedData, setEditedData] = useState(data);
  const [isLabelEditing, setIsLabelEditing] = useState(false);
  const [isThresholdEditing, setIsThresholdEditing] = useState(false);
  const [isScoreRangeEditing, setIsScoreRangeEditing] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Update local state when props change
  useEffect(() => {
    setEditedData(data);
  }, [data]);

  // Function to normalize data point score based on global min/max and data point min/max
  const normalizeScore = (dataPoint) => {
    const factor = (editedData.maxScore - editedData.minScore) / 
      (dataPoint.maxScore - dataPoint.minScore);
    
    return (dataPoint.score * factor) - 
      (dataPoint.minScore * factor) + 
      editedData.minScore;
  };

  // Get the normalized scores for each selected type and index
  const getSeriesData = () => {
    const seriesData = {};
    const indexMap = {};
    
    // Initialize series data for each type
    editedData.selectedTypes.forEach(type => {
      seriesData[type] = [];
    });
    
    // Filter data points to only include selected indices and types
    editedData.dataPoints
      .filter(point => 
        editedData.selectedIndices.includes(point.index) && 
        editedData.selectedTypes.includes(point.type)
      )
      .forEach(point => {
        // Normalize the score
        const normalizedScore = normalizeScore(point);
        
        // Add to appropriate series
        seriesData[point.type].push({
          index: point.index,
          value: normalizedScore,
          label: point.label
        });
        
        // Track unique indices
        indexMap[point.index] = point.label;
      });
    
    // Sort each series by index
    Object.keys(seriesData).forEach(type => {
      seriesData[type].sort((a, b) => a.index - b.index);
    });
    
    return { seriesData, indexMap };
  };

  // Colors for performance regions
  const developingColor = 'rgba(255, 76, 81, 0.12)';     // Modern red, more subtle
  const emergingColor = 'rgba(255, 152, 0, 0.12)';      // Warm orange, more subtle
  const proficientColor = 'rgba(46, 125, 231, 0.12)';   // Modern blue, more subtle
  const exceptionalColor = 'rgba(6, 189, 109, 0.12)';   // Contemporary green, more subtle

  // Theme colors for sliders
  const sliderColors = {
    developing: '#ff4c51',      // Modern red
    emerging: '#ff9800',        // Warm orange
    proficient: '#2e7de7',      // Modern blue
    exceptional: '#06bd6d'      // Contemporary green
  };

  // Line colors for different assessment types
  const lineColors = {
    survey: '#06bd6d',         // Emerald Green - for self assessment (survey)
    peer: '#9333ea'            // Vibrant purple - for peer assessment
  };

  // Prepare the chart data with extended lines to edges
  const prepareChartData = () => {
    const { seriesData: dataByType, indexMap } = getSeriesData();
    const types = editedData.selectedTypes;
    
    // Collect all unique indices from all data points
    const allIndices = [...new Set(
      editedData.dataPoints
        .filter(point => 
          editedData.selectedIndices.includes(point.index) && 
          editedData.selectedTypes.includes(point.type)
        )
        .map(point => point.index)
    )].sort((a, b) => a - b);
    
    if (allIndices.length === 0) return { series: [], xLabels: [], allPoints: [] };
    
    // For chart display, create a mapping of indices to positions
    // This ensures consistent spacing across all data points
    const indexToPosition = {};
    const xLabels = {};
    
    // Create horizontal space for each unique index
    const totalWidth = 100; // Use 100 units for visual scaling
    
    // Adjust margins based on number of points - smaller margins for fewer points
    const marginPercentage = Math.max(5, Math.min(30, 30 - allIndices.length * 5));
    const leftMargin = marginPercentage;
    const rightMargin = marginPercentage;
    const usableWidth = totalWidth - leftMargin - rightMargin;
    
    if (allIndices.length === 1) {
      // If only one unique index, center it
      indexToPosition[allIndices[0]] = totalWidth / 2;
    } else if (allIndices.length === 2) {
      // For just two indices, position them closer together
      const centerPoint = totalWidth / 2;
      const spacing = Math.min(20, usableWidth / 3); // Even tighter spacing for two points
      
      indexToPosition[allIndices[0]] = centerPoint - spacing;
      indexToPosition[allIndices[1]] = centerPoint + spacing;
    } else {
      // Multiple indices - space them evenly based on their numeric values
      const minIndex = Math.min(...allIndices);
      const maxIndex = Math.max(...allIndices);
      const indexRange = maxIndex - minIndex;
      
      // Map each index to a position
      allIndices.forEach(index => {
        // Calculate position proportional to index value
        const normalizedPosition = (index - minIndex) / (indexRange || 1);
        indexToPosition[index] = leftMargin + (normalizedPosition * usableWidth);
        
        // Get label for this index from any data point with this index
        const pointsWithThisIndex = editedData.dataPoints.filter(p => p.index === index);
        if (pointsWithThisIndex.length > 0) {
          xLabels[index] = pointsWithThisIndex[0].label;
        } else {
          xLabels[index] = `Index ${index}`;
        }
      });
    }
    
    // Generate x-axis positions for chart - with exact positions for each data point (no duplicates)
    const chartPositions = allIndices.map(index => indexToPosition[index]);
    
    // Add left and right extension points if needed
    if (chartPositions.length > 0 && chartPositions[0] > 0) {
      chartPositions.unshift(0); // Add left edge
    }
    if (chartPositions.length > 0 && chartPositions[chartPositions.length - 1] < 100) {
      chartPositions.push(100); // Add right edge
    }
    
    // Create labels for all positions
    const formattedXLabels = chartPositions.map((position, idx) => {
      // First and last positions (extensions) get empty labels
      if (idx === 0 && position === 0) return '';
      if (idx === chartPositions.length - 1 && position === 100) return '';
      
      // Get the index that corresponds to this position
      const index = Object.keys(indexToPosition).find(idx => 
        Math.abs(indexToPosition[idx] - position) < 0.001
      );
      
      return index ? xLabels[index] : '';
    });
    
    // Now map the actual data points to positions
    const allPoints = [];
    const series = [];
    
    // Create series for each assessment type
    types.forEach(type => {
      if (!dataByType[type] || dataByType[type].length === 0) return;
      
      // Get the data points for this type, sorted by index
      const typePoints = [...dataByType[type]].sort((a, b) => a.index - b.index);
      
      // Create an array matching the length of chartPositions, filled with nulls
      const typeSeriesData = new Array(chartPositions.length).fill(null);
      
      // For each data point, find its corresponding position in the chartPositions array
      typePoints.forEach(point => {
        const position = indexToPosition[point.index];
        // Find the exact position index in chartPositions
        const positionIndex = chartPositions.findIndex(p => Math.abs(p - position) < 0.001);
        
        if (positionIndex !== -1) {
          typeSeriesData[positionIndex] = point.value;
        }
      });
      
      // Handle extensions if we have at least one data point
      if (typePoints.length > 0) {
        // Left extension - only set if first position is at index 0 (the extension point)
        const firstPointIndex = typeSeriesData.findIndex(v => v !== null);
        if (firstPointIndex > 0) {
          typeSeriesData[0] = typeSeriesData[firstPointIndex];
        }
        
        // Right extension - only set if last position is at the last index (extension point)
        const lastNonNullIndex = typeSeriesData.map((value, index) => value !== null ? index : -1).filter(index => index !== -1).pop();
        if (lastNonNullIndex !== undefined && lastNonNullIndex < typeSeriesData.length - 1) {
          typeSeriesData[typeSeriesData.length - 1] = typeSeriesData[lastNonNullIndex];
        }
      }
      
      // Add to series
      series.push({
        data: typeSeriesData,
        label: type.charAt(0).toUpperCase() + type.slice(1) + ' Assessment',
        color: lineColors[type] || theme.palette.grey[500],
        showMark: true,
        connectNulls: true
      });
    });
    
    return { 
      series, 
      xLabels: formattedXLabels, 
      allPoints, 
      chartPositions,
      indexToPosition
    };
  };

  // Handle label change
  const handleLabelChange = (e) => {
    const newData = {
      ...editedData,
      label: e.target.value
    };
    setEditedData(newData);
  };

  // Validate min/max score changes
  const validateScoreRange = (field, value) => {
    const numValue = Number(value);
    
    // Ensure min score is less than threshold1
    if (field === 'minScore') {
      return numValue < editedData.threshold1;
    }
    
    // Ensure max score is greater than threshold3
    if (field === 'maxScore') {
      return numValue > editedData.threshold3;
    }
    
    return true;
  };

  // Handle min/max score changes
  const handleScoreRangeChange = (field, value) => {
    const numValue = Number(value);
    
    // Basic validation
    if (field === 'minScore' && numValue >= editedData.threshold1) {
      return; // Minimum score must be less than threshold1
    }
    
    if (field === 'maxScore' && numValue <= editedData.threshold3) {
      return; // Maximum score must be greater than threshold3
    }
    
    const newData = {
      ...editedData,
      [field]: numValue
    };
    setEditedData(newData);
    setRenderKey(prev => prev + 1);
  };

  // Handle threshold changes (now used by sliders)
  const handleThresholdChange = (field, value) => {
    const numValue = Number(value);
    
    // Validation for thresholds
    if (field === 'threshold1' && (numValue <= editedData.minScore || numValue >= editedData.threshold2)) {
      return; // Invalid threshold1
    }
    
    if (field === 'threshold2' && (numValue <= editedData.threshold1 || numValue >= editedData.threshold3)) {
      return; // Invalid threshold2
    }
    
    if (field === 'threshold3' && (numValue <= editedData.threshold2 || numValue >= editedData.maxScore)) {
      return; // Invalid threshold3
    }
    
    const newData = {
      ...editedData,
      [field]: numValue
    };
    setEditedData(newData);
    setRenderKey(prev => prev + 1);
  };

  // Handle threshold slider changes
  const handleSliderChange = (field) => (_, newValue) => {
    handleThresholdChange(field, newValue);
  };

  // Handle type selection
  const handleTypeSelection = (type) => {
    const newSelectedTypes = editedData.selectedTypes.includes(type)
      ? editedData.selectedTypes.filter(t => t !== type)
      : [...editedData.selectedTypes, type];
    
    const newData = {
      ...editedData,
      selectedTypes: newSelectedTypes
    };
    setEditedData(newData);
    onChange(newData);
  };

  // Handle index selection
  const handleIndexSelection = (index) => {
    const newSelectedIndices = editedData.selectedIndices.includes(index)
      ? editedData.selectedIndices.filter(i => i !== index)
      : [...editedData.selectedIndices, index];

    const newData = {
      ...editedData,
      selectedIndices: newSelectedIndices
    };
    setEditedData(newData);
    onChange(newData);
  };

  // Save changes to various fields
  const saveLabel = () => {
    setIsLabelEditing(false);
    onChange(editedData);
  };

  const saveThresholds = () => {
    setIsThresholdEditing(false);
    onChange(editedData);
  };

  const saveScoreRange = () => {
    setIsScoreRangeEditing(false);
    onChange(editedData);
  };

  // Prepare data for the chart
  const { series, allPoints, chartPositions, xLabels: formattedXLabels } = prepareChartData();

  // Background region styles calculated directly in the render
  const totalRange = editedData.maxScore - editedData.minScore;
  const exceptionalHeight = totalRange > 0 ? 
    (editedData.maxScore - editedData.threshold3) / totalRange * 100 : 25;
  const proficientHeight = totalRange > 0 ? 
    (editedData.threshold3 - editedData.threshold2) / totalRange * 100 : 25;
  const emergingHeight = totalRange > 0 ? 
    (editedData.threshold2 - editedData.threshold1) / totalRange * 100 : 25;
  const developingHeight = totalRange > 0 ? 
    (editedData.threshold1 - editedData.minScore) / totalRange * 100 : 25;

  return (
    <Card elevation={3}>
      <CardContent>
        {/* Graph Title/Label */}
        <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
          {isLabelEditing ? (
            <Box display="flex" alignItems="center" width="100%">
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={editedData.label}
                onChange={handleLabelChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={saveLabel} disabled={disabled}>
                        <CheckIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                disabled={disabled}
              />
            </Box>
          ) : (
            <Box display="flex" alignItems="center">
              <Typography variant="h6" component="h2">
                {editedData.label}
              </Typography>
              <IconButton size="small" onClick={() => setIsLabelEditing(true)} disabled={disabled}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* The actual chart */}
        <Box key={renderKey} sx={{ position: 'relative', height: 300, width: '100%' }}>
          {series.length > 0 ? (
            <>
              {/* Performance Region Backgrounds - using explicit height calculations */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 48, // Add top padding to account for chart's top margin
                  left: 32, // Add left padding to account for chart's Y-axis
                  right: 16, // Add right padding
                  bottom: 17, // Add bottom padding to account for chart's X-axis
                  zIndex: 0
                }}
              >
                {/* Exceptional Region */}
                <Box sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${exceptionalHeight}%`,
                  bgcolor: exceptionalColor,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pr: 1
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Exceptional
                  </Typography>
                </Box>
                
                {/* Proficient Region */}
                <Box sx={{ 
                  position: 'absolute',
                  top: `${exceptionalHeight}%`,
                  left: 0,
                  width: '100%',
                  height: `${proficientHeight}%`,
                  bgcolor: proficientColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pr: 1
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Proficient
                  </Typography>
                </Box>
                
                {/* Emerging Region */}
                <Box sx={{ 
                  position: 'absolute',
                  top: `${exceptionalHeight + proficientHeight}%`,
                  left: 0,
                  width: '100%',
                  height: `${emergingHeight}%`, 
                  bgcolor: emergingColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pr: 1
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Emerging
                  </Typography>
                </Box>
                
                {/* Developing Region */}
                <Box sx={{ 
                  position: 'absolute',
                  top: `${exceptionalHeight + proficientHeight + emergingHeight}%`,
                  left: 0,
                  width: '100%',
                  height: `${developingHeight}%`,
                  bgcolor: developingColor,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pr: 1
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Developing
                  </Typography>
                </Box>
              </Box>
              
              {/* Line Chart */}
              <LineChart
                sx={{ position: 'relative', zIndex: 1 }}
                series={series}
                xAxis={[{ 
                  data: chartPositions, 
                  scaleType: 'linear', 
                  min: 0, 
                  max: 100,
                  tickInterval: chartPositions.filter(p => {
                    // Only show ticks at actual data points, not at extension points
                    return p > 0 && p < 100;
                  }),
                  valueFormatter: (val, index) => {
                    return formattedXLabels[index] || '';
                  }
                }]}
                yAxis={[{
                  min: editedData.minScore,
                  max: editedData.maxScore
                }]}
                height={300}
                slotProps={{
                  line: {
                    connectNulls: true,
                    curve: "linear"
                  }
                }}
                disableAxisListener={true}
              />
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              borderRadius: 1
            }}>
              <Typography color="textSecondary">
                No data points selected. Please select data points to display the chart.
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          {/* Data Series Selection */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Data Series
            </Typography>
            <FormGroup row>
              {editedData.types.map((type) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={editedData.selectedTypes.includes(type)}
                      onChange={() => handleTypeSelection(type)}
                      color="primary"
                      disabled={disabled}
                    />
                  }
                  label={type.charAt(0).toUpperCase() + type.slice(1) + ' Assessment'}
                />
              ))}
            </FormGroup>
          </Grid>

          {/* Milestone Selection */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Milestones to Include
            </Typography>
            <Box>
              {editedData.dataPoints
                .filter((point, index, self) => 
                  index === self.findIndex((p) => p.index === point.index)
                )
                .sort((a, b) => a.index - b.index)
                .map((point) => (
                  <Chip
                    key={point.index}
                    label={point.label}
                    color={editedData.selectedIndices.includes(point.index) ? "primary" : "default"}
                    onClick={() => handleIndexSelection(point.index)}
                    sx={{ m: 0.5 }}
                    disabled={disabled}
                  />
                ))}
            </Box>
          </Grid>

          {/* Thresholds */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">
                Performance Thresholds
              </Typography>
              {isThresholdEditing ? (
                <IconButton size="small" onClick={saveThresholds} disabled={disabled}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton size="small" onClick={() => setIsThresholdEditing(true)} disabled={disabled}>
                  <TuneIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            {isThresholdEditing ? (
              <Stack spacing={3}>
                {/* Threshold1 Slider */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="medium">
                      Developing to Emerging
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight="bold">
                      {editedData.threshold1}
                    </Typography>
                  </Box>
                  <Slider
                    value={editedData.threshold1}
                    onChange={handleSliderChange('threshold1')}
                    min={editedData.minScore}
                    max={editedData.threshold2}
                    step={0.1}
                    valueLabelDisplay="auto"
                    disabled={disabled}
                    sx={{ 
                      color: sliderColors.developing,
                      '& .MuiSlider-thumb': {
                        height: 24,
                        width: 24,
                        backgroundColor: '#fff',
                        border: `2px solid ${sliderColors.developing}`,
                        '&:focus, &:hover, &.Mui-active': {
                          boxShadow: `0px 0px 0px 8px ${theme.palette.error.lighter}`,
                        },
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Range: {editedData.minScore} to {editedData.threshold2}
                  </Typography>
                </Box>
                
                {/* Threshold2 Slider */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="medium">
                      Emerging to Proficient
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight="bold">
                      {editedData.threshold2}
                    </Typography>
                  </Box>
                  <Slider
                    value={editedData.threshold2}
                    onChange={handleSliderChange('threshold2')}
                    min={editedData.threshold1}
                    max={editedData.threshold3}
                    step={0.1}
                    valueLabelDisplay="auto"
                    disabled={disabled}
                    sx={{ 
                      color: sliderColors.emerging,
                      '& .MuiSlider-thumb': {
                        height: 24,
                        width: 24,
                        backgroundColor: '#fff',
                        border: `2px solid ${sliderColors.emerging}`,
                        '&:focus, &:hover, &.Mui-active': {
                          boxShadow: `0px 0px 0px 8px ${theme.palette.warning.lighter}`,
                        },
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Range: {editedData.threshold1} to {editedData.threshold3}
                  </Typography>
                </Box>
                
                {/* Threshold3 Slider */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="medium">
                      Proficient to Exceptional
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight="bold">
                      {editedData.threshold3}
                    </Typography>
                  </Box>
                  <Slider
                    value={editedData.threshold3}
                    onChange={handleSliderChange('threshold3')}
                    min={editedData.threshold2}
                    max={editedData.maxScore}
                    step={0.1}
                    valueLabelDisplay="auto"
                    disabled={disabled}
                    sx={{ 
                      color: sliderColors.proficient,
                      '& .MuiSlider-thumb': {
                        height: 24,
                        width: 24,
                        backgroundColor: '#fff',
                        border: `2px solid ${sliderColors.proficient}`,
                        '&:focus, &:hover, &.Mui-active': {
                          boxShadow: `0px 0px 0px 8px ${theme.palette.primary.lighter}`,
                        },
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Range: {editedData.threshold2} to {editedData.maxScore}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Box sx={{ px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    Developing
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    &#60; {editedData.threshold1}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    Emerging
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {editedData.threshold1} - {editedData.threshold2}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    Proficient
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {editedData.threshold2} - {editedData.threshold3}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">
                    Exceptional
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    &#62; {editedData.threshold3}
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>

          {/* Score Range */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">
                Score Range
              </Typography>
              {isScoreRangeEditing ? (
                <IconButton size="small" onClick={saveScoreRange} disabled={disabled}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton size="small" onClick={() => setIsScoreRangeEditing(true)} disabled={disabled}>
                  <TuneIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            {isScoreRangeEditing ? (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" gutterBottom>
                    Minimum Score
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={editedData.minScore}
                    onChange={(e) => handleScoreRangeChange('minScore', e.target.value)}
                    disabled={disabled}
                    InputProps={{
                      inputProps: { 
                        max: editedData.threshold1 - 1,
                        step: "any" 
                      }
                    }}
                    helperText={`Can be negative. Must be less than ${editedData.threshold1}`}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" gutterBottom>
                    Maximum Score
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={editedData.maxScore}
                    onChange={(e) => handleScoreRangeChange('maxScore', e.target.value)}
                    disabled={disabled}
                    InputProps={{
                      inputProps: { 
                        min: editedData.threshold3 + 1,
                        step: "any" 
                      }
                    }}
                    helperText={`Must be greater than ${editedData.threshold3}`}
                  />
                </Box>
              </Stack>
            ) : (
              <Box sx={{ px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    Min Score: {editedData.minScore}
                  </Typography>
                  <Typography variant="body2">
                    Max Score: {editedData.maxScore}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  This defines the global score range for the graph. Individual data points may have different min/max values which will be normalized to this range.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GrowthGraph;
