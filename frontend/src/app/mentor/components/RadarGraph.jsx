import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Box, Typography, Slider, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Paper, Divider, IconButton, Chip, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import DownloadIcon from '@mui/icons-material/Download';
import html2canvas from 'html2canvas';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Constants for line colors to ensure consistency
const LINE_COLORS = {
  line1: {
    background: 'rgba(255, 99, 132, 0.2)',
    border: 'rgba(255, 99, 132, 1)',
    solid: 'rgb(255, 99, 132)'
  },
  line2: {
    background: 'rgba(54, 162, 235, 0.2)',
    border: 'rgba(54, 162, 235, 1)',
    solid: 'rgb(54, 162, 235)'
  }
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.primary,
  height: '100%'
}));

const CategoryChip = styled(Chip)(({ bgColor }) => ({
  backgroundColor: bgColor,
  marginRight: '8px',
  '& .MuiChip-label': {
    fontWeight: 'bold',
  }
}));

// Function to wrap text into multiple lines
const wrapLabel = (label) => {
  if (label.length <= 14) return label;
  
  // Split label into words
  const words = label.split(' ');
  let lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length <= 14) {
      currentLine += (currentLine.length ? ' ' : '') + word;
    } else {
      if (currentLine.length) lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine.length) lines.push(currentLine);
  
  return lines;
};

const RadarGraph = ({ data, onChange, entityId }) => {
  const [graphData, setGraphData] = useState(data);
  const [editingLabel, setEditingLabel] = useState(false);
  const [isEditingThresholds, setIsEditingThresholds] = useState(false);
  const [chartDataState, setChartDataState] = useState({
    labels: [],
    datasets: []
  });
  const [chartKey, setChartKey] = useState(0);
  const chartRef = useRef(null);
  const graphContainerRef = useRef(null);

  useEffect(() => {
    setGraphData(data);
  }, [data]);
  
  // Update chart data when graphData changes (including thresholds)
  useEffect(() => {
    if (!graphData?.focusAreas?.length) return;
    
    // Include helper functions within effect scope to avoid dependency issues
    // Helper function to determine the color based on score and thresholds
    const getColorForScoreInEffect = (score) => {
      const { minScore, threshold1, threshold2, threshold3, maxScore } = graphData;
      
      if (score >= minScore && score < threshold1) {
        return 'rgba(255, 99, 132, 0.2)'; // Developing - Red
      } else if (score >= threshold1 && score < threshold2) {
        return 'rgba(255, 205, 86, 0.2)'; // Progressing - Yellow
      } else if (score >= threshold2 && score < threshold3) {
        return 'rgba(54, 162, 235, 0.2)'; // Proficient - Blue
      } else {
        return 'rgba(75, 192, 192, 0.2)'; // Mastering - Green
      }
    };

    // Function to get border color within effect scope
    const getBorderColorForScoreInEffect = (score) => {
      const { minScore, threshold1, threshold2, threshold3, maxScore } = graphData;
      
      if (score >= minScore && score < threshold1) {
        return 'rgb(255, 99, 132)'; // Developing - Red
      } else if (score >= threshold1 && score < threshold2) {
        return 'rgb(255, 205, 86)'; // Progressing - Yellow
      } else if (score >= threshold2 && score < threshold3) {
        return 'rgb(54, 162, 235)'; // Proficient - Blue
      } else {
        return 'rgb(75, 192, 192)'; // Mastering - Green
      }
    };
    
    // Get score function within effect scope
    const getSelectedScoreInEffect = (line, focusAreaLabel) => {
      const focusArea = line.focusAreas.find(area => area.label === focusAreaLabel);
      if (!focusArea) return 0;
      
      const selectedDataPoint = focusArea.dataPoints[focusArea.selectedIndex];
      return selectedDataPoint ? selectedDataPoint.score : 0;
    };
    
    // Function to get short labels within this effect
    const shortLabels = graphData.focusAreas.map((label, index) => `Focus Area ${index + 1}`);
    
    const updatedChartData = {
      labels: shortLabels,
      datasets: [
        {
          label: graphData.line1.label,
          data: graphData.focusAreas.map(area => 
            getSelectedScoreInEffect(graphData.line1, area)
          ),
          backgroundColor: LINE_COLORS.line1.background,
          borderColor: LINE_COLORS.line1.border,
          borderWidth: 2,
          pointBackgroundColor: graphData.focusAreas.map(area => 
            getBorderColorForScoreInEffect(getSelectedScoreInEffect(graphData.line1, area))
          ),
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: LINE_COLORS.line1.border,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: graphData.line2.label,
          data: graphData.focusAreas.map(area => 
            getSelectedScoreInEffect(graphData.line2, area)
          ),
          backgroundColor: LINE_COLORS.line2.background,
          borderColor: LINE_COLORS.line2.border,
          borderWidth: 2,
          pointBackgroundColor: graphData.focusAreas.map(area => 
            getBorderColorForScoreInEffect(getSelectedScoreInEffect(graphData.line2, area))
          ),
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: LINE_COLORS.line2.border,
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    };
    
    setChartDataState(updatedChartData);
    
    // Use setTimeout to ensure chart update happens after state is updated
    setTimeout(() => {
      if (chartRef && chartRef.current) {
        try {
          chartRef.current.update();
        } catch (error) {
          console.error("Error updating chart:", error);
        }
      }
    }, 0);
    
  }, [graphData]);

  // Helper function to determine the color based on score and thresholds
  const getColorForScore = (score) => {
    const { minScore, threshold1, threshold2, threshold3, maxScore } = graphData;
    
    if (score >= minScore && score < threshold1) {
      return 'rgba(255, 99, 132, 0.2)'; // Developing - Red
    } else if (score >= threshold1 && score < threshold2) {
      return 'rgba(255, 205, 86, 0.2)'; // Progressing - Yellow
    } else if (score >= threshold2 && score < threshold3) {
      return 'rgba(54, 162, 235, 0.2)'; // Proficient - Blue
    } else {
      return 'rgba(75, 192, 192, 0.2)'; // Mastering - Green
    }
  };

  // Function to get border color (darker version of background color)
  const getBorderColorForScore = (score) => {
    const { minScore, threshold1, threshold2, threshold3, maxScore } = graphData;
    
    if (score >= minScore && score < threshold1) {
      return 'rgb(255, 99, 132)'; // Developing - Red
    } else if (score >= threshold1 && score < threshold2) {
      return 'rgb(255, 205, 86)'; // Progressing - Yellow
    } else if (score >= threshold2 && score < threshold3) {
      return 'rgb(54, 162, 235)'; // Proficient - Blue
    } else {
      return 'rgb(75, 192, 192)'; // Mastering - Green
    }
  };

  // Get the current selected data point score for a specific focus area
  const getSelectedScore = (line, focusAreaLabel) => {
    const focusArea = line.focusAreas.find(area => area.label === focusAreaLabel);
    if (!focusArea) return 0;
    
    const selectedDataPoint = focusArea.dataPoints[focusArea.selectedIndex];
    return selectedDataPoint ? selectedDataPoint.score : 0;
  };

  // Function to handle changing the selected data point
  const handleChangeDataPoint = (lineKey, focusAreaIndex, direction) => {
    const updatedGraphData = { ...graphData };
    const focusArea = updatedGraphData[lineKey].focusAreas[focusAreaIndex];
    const dataPointsLength = focusArea.dataPoints.length;
    
    if (dataPointsLength <= 1) return;
    
    let newIndex = (focusArea.selectedIndex + direction) % dataPointsLength;
    // Handle negative index
    if (newIndex < 0) newIndex = dataPointsLength - 1;
    
    focusArea.selectedIndex = newIndex;
    
    setGraphData(updatedGraphData);
    if (onChange) onChange(updatedGraphData);
  };

  // Handle threshold changes
  const handleThresholdChange = (threshold, value) => {
    const updatedGraphData = { ...graphData };
    updatedGraphData[threshold] = value;
    
    // Ensure thresholds remain in correct order
    if (threshold === 'threshold1' && value >= updatedGraphData.threshold2) {
      updatedGraphData.threshold1 = updatedGraphData.threshold2 - 1;
    } else if (threshold === 'threshold2') {
      if (value <= updatedGraphData.threshold1) {
        updatedGraphData.threshold2 = updatedGraphData.threshold1 + 1;
      } else if (value >= updatedGraphData.threshold3) {
        updatedGraphData.threshold2 = updatedGraphData.threshold3 - 1;
      }
    } else if (threshold === 'threshold3' && value <= updatedGraphData.threshold2) {
      updatedGraphData.threshold3 = updatedGraphData.threshold2 + 1;
    }
    
    // Update graph data state
    setGraphData(updatedGraphData);
    
    // Increment the chart key to force complete re-rendering
    setChartKey(prevKey => prevKey + 1);
    
    // Use setTimeout to ensure state updates have occurred before updating chart
    setTimeout(() => {
      if (chartRef && chartRef.current) {
        chartRef.current.update();
      }
    }, 0);
    
    if (onChange) onChange(updatedGraphData);
  };

  // Handle label edit
  const handleLabelChange = (event) => {
    const updatedGraphData = { ...graphData };
    updatedGraphData.label = event.target.value;
    setGraphData(updatedGraphData);
    if (onChange) onChange(updatedGraphData);
  };

  // Create standardized, shortened labels for the radar chart
  // Using consistent short labels to maintain a stable chart shape
  const getShortLabels = () => {
    return graphData.focusAreas.map((label, index) => {
      // Create a short label with the focus area number
      return `Focus Area ${index + 1}`;
    });
  };

  // Prepare chart data - replacing with the reactive state version
  const chartData = chartDataState;

  // Chart options
  const chartOptions = {
    scales: {
      r: {
        min: graphData.minScore,
        max: graphData.maxScore,
        ticks: {
          stepSize: 20,
          backdropColor: 'rgba(0, 0, 0, 0)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#333',
          padding: 20,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          padding: 15,
          font: {
            size: 14,
            weight: 'bold'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          boxHeight: 10,
          // Ensure legend items use correct colors from datasets
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, i) => ({
              text: dataset.label,
              fillStyle: i === 0 ? LINE_COLORS.line1.solid : LINE_COLORS.line2.solid,
              strokeStyle: i === 0 ? LINE_COLORS.line1.solid : LINE_COLORS.line2.solid,
              fontColor: i === 0 ? LINE_COLORS.line1.solid : LINE_COLORS.line2.solid,
              lineWidth: 2,
              hidden: !chart.isDatasetVisible(i),
              index: i,
              datasetIndex: i
            }));
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          weight: 'bold',
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        callbacks: {
          title: (tooltipItems) => {
            // Show the real focus area name in the tooltip
            const index = tooltipItems[0].dataIndex;
            return graphData.focusAreas[index];
          },
          label: (context) => {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.r;
            const focusAreaLabel = graphData.focusAreas[context.dataIndex];
            
            // Find the selected data point's label
            const lineKey = context.datasetIndex === 0 ? 'line1' : 'line2';
            const focusArea = graphData[lineKey].focusAreas.find(area => area.label === focusAreaLabel);
            const dataPointLabel = focusArea?.dataPoints[focusArea.selectedIndex]?.label || '';
            
            let scoreCategory = '';
            if (value < graphData.threshold1) {
              scoreCategory = 'Developing';
            } else if (value < graphData.threshold2) {
              scoreCategory = 'Progressing';
            } else if (value < graphData.threshold3) {
              scoreCategory = 'Proficient';
            } else {
              scoreCategory = 'Mastering';
            }
            
            return [
              `${datasetLabel}: ${value.toFixed(1)}`,
              `Evaluation: ${dataPointLabel}`,
              `Category: ${scoreCategory}`
            ];
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Function to handle downloading the radar graph as PNG
  const handleDownloadGraph = async () => {
    if (!graphContainerRef.current || !chartRef.current) return;
    
    try {
      // Create a temporary container for the export version
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'absolute';
      exportContainer.style.left = '-9999px';
      exportContainer.style.top = '-9999px';
      exportContainer.style.width = '800px'; // Fixed width for consistent export
      exportContainer.style.height = 'auto';
      exportContainer.style.backgroundColor = 'white';
      exportContainer.style.padding = '20px';
      document.body.appendChild(exportContainer);
      
      // Create title element
      const titleElement = document.createElement('h2');
      titleElement.textContent = graphData.label;
      titleElement.style.textAlign = 'center';
      titleElement.style.marginBottom = '20px';
      titleElement.style.fontFamily = 'Arial, sans-serif';
      titleElement.style.fontSize = '20px';
      exportContainer.appendChild(titleElement);
      
      // Create a container for the chart
      const chartContainer = document.createElement('div');
      chartContainer.style.height = '400px';
      chartContainer.style.width = '100%';
      chartContainer.style.position = 'relative';
      
      // Create legend container
      const legendContainer = document.createElement('div');
      legendContainer.style.display = 'flex';
      legendContainer.style.justifyContent = 'center';
      legendContainer.style.gap = '24px';
      legendContainer.style.marginBottom = '20px';
      
      // Add legend items
      const legendItems = [
        { label: graphData.line1.label, color: LINE_COLORS.line1.solid },
        { label: graphData.line2.label, color: LINE_COLORS.line2.solid }
      ];
      
      legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        
        const colorDot = document.createElement('span');
        colorDot.style.width = '12px';
        colorDot.style.height = '12px';
        colorDot.style.borderRadius = '50%';
        colorDot.style.backgroundColor = item.color;
        colorDot.style.marginRight = '8px';
        
        const label = document.createElement('span');
        label.textContent = item.label;
        label.style.fontFamily = 'Arial, sans-serif';
        label.style.fontWeight = 'bold';
        label.style.color = item.color;
        
        legendItem.appendChild(colorDot);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
      });
      
      chartContainer.appendChild(legendContainer);
      
      // Create a new canvas for the chart
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '350px';
      chartContainer.appendChild(canvas);
      exportContainer.appendChild(chartContainer);
      
      // Clone the Chart.js instance
      const ctx = canvas.getContext('2d');
      
      // Create a new chart with the same data and options
      const newChart = new ChartJS(ctx, {
        type: 'radar',
        data: {...chartDataState},
        options: {...chartOptions, 
          plugins: {
            ...chartOptions.plugins,
            legend: {
              display: false // hide legend as we've created a custom one
            }
          }
        },
        plugins: [backgroundPlugin]
      });
      
      // Wait for chart to render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Add performance categories
      const categoriesContainer = document.createElement('div');
      categoriesContainer.style.display = 'flex';
      categoriesContainer.style.flexDirection = 'column';
      categoriesContainer.style.marginTop = '30px';
      categoriesContainer.style.marginBottom = '20px';
      
      const categoriesTitle = document.createElement('h3');
      categoriesTitle.textContent = 'Performance Categories:';
      categoriesTitle.style.fontSize = '16px';
      categoriesTitle.style.fontWeight = 'bold';
      categoriesTitle.style.marginBottom = '10px';
      categoriesTitle.style.fontFamily = 'Arial, sans-serif';
      categoriesContainer.appendChild(categoriesTitle);
      
      const categories = [
        { label: 'Developing', color: 'rgba(255, 99, 132, 0.25)' },
        { label: 'Progressing', color: 'rgba(255, 205, 86, 0.25)' },
        { label: 'Proficient', color: 'rgba(54, 162, 235, 0.25)' },
        { label: 'Mastering', color: 'rgba(75, 192, 192, 0.25)' }
      ];
      
      const chipsContainer = document.createElement('div');
      chipsContainer.style.display = 'flex';
      chipsContainer.style.flexWrap = 'wrap';
      chipsContainer.style.gap = '10px';
      
      categories.forEach(category => {
        const chip = document.createElement('div');
        chip.textContent = category.label;
        chip.style.backgroundColor = category.color;
        chip.style.padding = '4px 12px';
        chip.style.borderRadius = '16px';
        chip.style.fontWeight = 'bold';
        chip.style.fontSize = '14px';
        chip.style.fontFamily = 'Arial, sans-serif';
        chipsContainer.appendChild(chip);
      });
      
      categoriesContainer.appendChild(chipsContainer);
      exportContainer.appendChild(categoriesContainer);
      
      // Create simplified focus areas list - only showing names
      const focusAreasContainer = document.createElement('div');
      focusAreasContainer.style.marginTop = '20px';
      
      // Add title for focus areas
      const focusAreasTitle = document.createElement('h3');
      focusAreasTitle.textContent = 'Focus Areas';
      focusAreasTitle.style.fontSize = '16px';
      focusAreasTitle.style.fontWeight = 'bold';
      focusAreasTitle.style.marginBottom = '10px';
      focusAreasTitle.style.fontFamily = 'Arial, sans-serif';
      focusAreasContainer.appendChild(focusAreasTitle);
      
      // Create list of focus areas with simplified view
      const focusAreasList = document.createElement('div');
      focusAreasList.style.display = 'flex';
      focusAreasList.style.flexDirection = 'column';
      focusAreasList.style.gap = '8px';
      
      // Add each focus area name
      graphData.focusAreas.forEach((area, index) => {
        const focusAreaItem = document.createElement('div');
        focusAreaItem.style.padding = '8px';
        focusAreaItem.style.borderLeft = '4px solid';
        focusAreaItem.style.borderLeftColor = index % 2 === 0 ? 
          LINE_COLORS.line1.solid : LINE_COLORS.line2.solid;
        focusAreaItem.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
        
        const focusAreaName = document.createElement('p');
        focusAreaName.textContent = `Focus Area ${index + 1}: ${area}`;
        focusAreaName.style.margin = '0';
        focusAreaName.style.fontWeight = 'bold';
        focusAreaName.style.fontFamily = 'Arial, sans-serif';
        
        focusAreaItem.appendChild(focusAreaName);
        focusAreasList.appendChild(focusAreaItem);
      });
      
      focusAreasContainer.appendChild(focusAreasList);
      exportContainer.appendChild(focusAreasContainer);
      
      // Wait for everything to render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use html2canvas to capture the export container
      const outputCanvas = await html2canvas(exportContainer, {
        backgroundColor: 'white',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${graphData.label.replace(/\s+/g, '_')}_radar_graph.png`;
      link.href = outputCanvas.toDataURL('image/png');
      link.click();
      
      // Clean up
      newChart.destroy();
      document.body.removeChild(exportContainer);
    } catch (error) {
      console.error('Error generating graph image:', error);
    }
  };

  // Create a memoized plugin that updates when graphData changes
  const backgroundPlugin = useMemo(() => {
    return {
      id: 'backgroundCircles',
      beforeDraw: (chart) => {
        const { ctx, chartArea, scales } = chart;
        const scale = scales.r;
        
        if (!scale) return;
        
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        
        // Draw background for each threshold sector
        const drawBackgroundSector = (minValue, maxValue, color) => {
          ctx.beginPath();
          
          // Draw sectors
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.25; // Increased from 0.1 to 0.25 for better visibility
          
          // Convert values to radii on the chart
          const minRadius = scale.getDistanceFromCenterForValue(minValue);
          const maxRadius = scale.getDistanceFromCenterForValue(maxValue);
          
          // Draw sector (full circle from 0 to 2*PI)
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
          ctx.arc(centerX, centerY, minRadius, Math.PI * 2, 0, true);
          ctx.closePath();
          ctx.fill();
          
          ctx.globalAlpha = 1;
        };
        
        // Always use current threshold values from the state
        // This ensures the background redraws with updated thresholds
        drawBackgroundSector(graphData.threshold3, graphData.maxScore, 'rgba(75, 192, 192, 0.7)'); // Mastering zone - Increased opacity
        drawBackgroundSector(graphData.threshold2, graphData.threshold3, 'rgba(54, 162, 235, 0.7)'); // Proficient zone - Increased opacity
        drawBackgroundSector(graphData.threshold1, graphData.threshold2, 'rgba(255, 205, 86, 0.7)'); // Progressing zone - Increased opacity
        drawBackgroundSector(graphData.minScore, graphData.threshold1, 'rgba(255, 99, 132, 0.7)'); // Developing zone - Increased opacity
      }
    };
  }, [graphData]); // Recreate the plugin when graphData changes

  // Map from label to corresponding focus area with color coding
  const focusAreaMap = () => {
    const shortLabels = getShortLabels();
    // Create color array to match dataset colors but with more opacity
    const colors = [
      'rgba(255, 99, 132, 0.08)',  // Light red for line1
      'rgba(54, 162, 235, 0.08)',  // Light blue for line2
      'rgba(255, 99, 132, 0.08)',  // Repeat
      'rgba(54, 162, 235, 0.08)'   // Repeat
    ];
    
    return shortLabels.map((label, index) => ({
      short: label,
      full: graphData.focusAreas[index],
      color: colors[index % colors.length],
      line1Score: getSelectedScore(graphData.line1, graphData.focusAreas[index]),
      line2Score: getSelectedScore(graphData.line2, graphData.focusAreas[index]),
      line1: {
        ...graphData.line1.focusAreas.find(area => area.label === graphData.focusAreas[index])
      },
      line2: {
        ...graphData.line2.focusAreas.find(area => area.label === graphData.focusAreas[index])
      }
    }));
  };

  // Get the current data point for a specific focus area and line
  const getCurrentDataPoint = (focusArea, lineKey) => {
    if (!focusArea || !focusArea[lineKey]) return null;
    const dataPoints = focusArea[lineKey].dataPoints;
    const selectedIndex = focusArea[lineKey].selectedIndex;
    return dataPoints[selectedIndex];
  };

  return (
    <Box sx={{ width: '100%', p: 2 }} ref={graphContainerRef}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Item elevation={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" flex={1}>
                {editingLabel ? (
                  <Box display="flex" alignItems="center" width="100%">
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={graphData.label}
                      onChange={handleLabelChange}
                      size="small"
                    />
                    <IconButton onClick={() => setEditingLabel(false)} color="primary">
                      <SaveIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" width="100%">
                    <Typography variant="h5" component="h2" fontWeight="bold" flex={1}>
                      {graphData.label}
                    </Typography>
                    <IconButton 
                      onClick={() => setEditingLabel(true)} 
                      color="primary" 
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
              
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadGraph}
              >
                Download
              </Button>
            </Box>
            
            <Box sx={{ 
              height: '400px', 
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}>
              {/* Custom legend */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2,
                  width: '100%',
                  gap: 4
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 18, 
                      height: 18, 
                      borderRadius: '50%', 
                      backgroundColor: LINE_COLORS.line1.solid,
                      mr: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} 
                  />
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 'bold', 
                    color: LINE_COLORS.line1.solid,
                    fontSize: '1rem'
                  }}>
                    {graphData.line1.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 18, 
                      height: 18, 
                      borderRadius: '50%', 
                      backgroundColor: LINE_COLORS.line2.solid,
                      mr: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} 
                  />
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 'bold', 
                    color: LINE_COLORS.line2.solid,
                    fontSize: '1rem'
                  }}>
                    {graphData.line2.label}
                  </Typography>
                </Box>
              </Box>
              
              <Radar 
                key={chartKey}
                data={chartData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false  // Hide the built-in legend
                    }
                  }
                }} 
                plugins={[backgroundPlugin]}
                ref={chartRef}
              />
            </Box>
            
            {/* Performance Categories moved up */}
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Performance Categories:
              </Typography>
              <Box display="flex" flexWrap="wrap" mb={2}>
                <CategoryChip 
                  label="Developing" 
                  bgColor="rgba(255, 99, 132, 0.25)" 
                  size="small"
                />
                <CategoryChip 
                  label="Progressing" 
                  bgColor="rgba(255, 205, 86, 0.25)" 
                  size="small"
                />
                <CategoryChip 
                  label="Proficient" 
                  bgColor="rgba(54, 162, 235, 0.25)" 
                  size="small"
                />
                <CategoryChip 
                  label="Mastering" 
                  bgColor="rgba(75, 192, 192, 0.25)" 
                  size="small"
                />
              </Box>
            </Box>
            
            {/* Threshold Settings moved up */}
            <Box mt={3}>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="subtitle1" component="h3" fontWeight="bold" flex={1}>
                  Threshold Settings
                </Typography>
                <IconButton 
                  onClick={() => setIsEditingThresholds(!isEditingThresholds)} 
                  color="primary" 
                  size="small"
                >
                  {isEditingThresholds ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </Box>
              
              {isEditingThresholds && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>
                      Developing Threshold (0-{graphData.threshold1})
                    </Typography>
                    <Slider
                      value={graphData.threshold1}
                      onChange={(e, value) => handleThresholdChange('threshold1', value)}
                      min={graphData.minScore + 1}
                      max={graphData.threshold2 - 1}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{ color: 'rgb(255, 99, 132)' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>
                      Progressing Threshold ({graphData.threshold1}-{graphData.threshold2})
                    </Typography>
                    <Slider
                      value={graphData.threshold2}
                      onChange={(e, value) => handleThresholdChange('threshold2', value)}
                      min={graphData.threshold1 + 1}
                      max={graphData.threshold3 - 1}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{ color: 'rgb(255, 205, 86)' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>
                      Proficient Threshold ({graphData.threshold2}-{graphData.threshold3})
                    </Typography>
                    <Slider
                      value={graphData.threshold3}
                      onChange={(e, value) => handleThresholdChange('threshold3', value)}
                      min={graphData.threshold2 + 1}
                      max={graphData.maxScore - 1}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{ color: 'rgb(54, 162, 235)' }}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Enhanced Focus Area Legend with integrated data point selection */}
            <Box mt={3} mb={4}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Focus Areas and Data Point Selection:
              </Typography>
              <Grid container spacing={2}>
                {focusAreaMap().map((item, index) => {
                  const line1DataPoint = getCurrentDataPoint(item, 'line1');
                  const line2DataPoint = getCurrentDataPoint(item, 'line2');
                  const hasLine1Points = item.line1?.dataPoints?.length > 1;
                  const hasLine2Points = item.line2?.dataPoints?.length > 1;
                  
                  return (
                    <Grid item xs={12} key={index}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2,
                          borderLeft: '4px solid',
                          borderLeftColor: index % 2 === 0 ? LINE_COLORS.line1.solid : LINE_COLORS.line2.solid,
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                          }
                        }}
                      >
                        <Grid container spacing={2}>
                          {/* Focus Area Information */}
                          <Grid item xs={12} md={4}>
                            <Box display="flex" flexDirection="column" height="100%">
                              <Box display="flex" alignItems="center" mb={1}>
                                <Box 
                                  sx={{
                                    bgcolor: index % 2 === 0 ? `${LINE_COLORS.line1.background.slice(0, -4)}0.1)` : `${LINE_COLORS.line2.background.slice(0, -4)}0.1)`,
                                    color: index % 2 === 0 ? LINE_COLORS.line1.solid : LINE_COLORS.line2.solid,
                                    width: 32,
                                    height: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    fontWeight: 'bold',
                                    mr: 1.5,
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {index + 1}
                                </Box>
                                <Typography 
                                  variant="subtitle2" 
                                  component="span" 
                                  sx={{ 
                                    fontWeight: 'bold',
                                    color: 'text.primary',
                                  }}
                                >
                                  Focus Area {index + 1}
                                </Typography>
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  mb: 1.5,
                                  color: 'text.primary',
                                  fontWeight: 'medium',
                                  lineHeight: 1.3,
                                  // No height limit since we have space
                                }}
                                title={item.full} // Native HTML tooltip
                              >
                                {item.full}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          {/* Line 1 Data Point Selection */}
                          <Grid item xs={12} sm={6} md={4}>
                            <Box 
                              sx={{ 
                                p: 1.5, 
                                border: '1px solid',
                                borderColor: `${LINE_COLORS.line1.background.slice(0, -4)}0.5)`,
                                borderRadius: 1,
                                backgroundColor: `${LINE_COLORS.line1.background.slice(0, -4)}0.05)`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography 
                                variant="subtitle2" 
                                fontWeight="bold" 
                                color={LINE_COLORS.line1.solid}
                                mb={1}
                              >
                                {graphData.line1.label}
                              </Typography>
                              
                              {line1DataPoint && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontWeight: 'medium', 
                                      color: 'text.secondary',
                                      display: 'flex',
                                      justifyContent: 'space-between'
                                    }}
                                  >
                                    <span>{line1DataPoint.label}</span>
                                    <span style={{ fontWeight: 'bold', color: LINE_COLORS.line1.solid }}>
                                      {line1DataPoint.score.toFixed(1)}
                                    </span>
                                  </Typography>
                                </Box>
                              )}
                              
                              {hasLine1Points && (
                                <Box display="flex" justifyContent="space-between" mt="auto">
                                  <IconButton 
                                    onClick={() => handleChangeDataPoint('line1', 
                                      graphData.line1.focusAreas.findIndex(
                                        area => area.label === item.full
                                      ), -1)}
                                    size="small"
                                    sx={{ p: 0.5 }}
                                  >
                                    <NavigateBeforeIcon fontSize="small" />
                                  </IconButton>
                                  <Typography variant="caption" color="text.secondary">
                                    Change Evaluation
                                  </Typography>
                                  <IconButton 
                                    onClick={() => handleChangeDataPoint('line1', 
                                      graphData.line1.focusAreas.findIndex(
                                        area => area.label === item.full
                                      ), 1)}
                                    size="small"
                                    sx={{ p: 0.5 }}
                                  >
                                    <NavigateNextIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                              
                              {!hasLine1Points && (
                                <Typography variant="caption" color="text.secondary" mt="auto">
                                  Only one evaluation available
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                          
                          {/* Line 2 Data Point Selection */}
                          <Grid item xs={12} sm={6} md={4}>
                            <Box 
                              sx={{ 
                                p: 1.5, 
                                border: '1px solid',
                                borderColor: `${LINE_COLORS.line2.background.slice(0, -4)}0.5)`,
                                borderRadius: 1,
                                backgroundColor: `${LINE_COLORS.line2.background.slice(0, -4)}0.05)`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography 
                                variant="subtitle2" 
                                fontWeight="bold" 
                                color={LINE_COLORS.line2.solid}
                                mb={1}
                              >
                                {graphData.line2.label}
                              </Typography>
                              
                              {line2DataPoint && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontWeight: 'medium', 
                                      color: 'text.secondary',
                                      display: 'flex',
                                      justifyContent: 'space-between'
                                    }}
                                  >
                                    <span>{line2DataPoint.label}</span>
                                    <span style={{ fontWeight: 'bold', color: LINE_COLORS.line2.solid }}>
                                      {line2DataPoint.score.toFixed(1)}
                                    </span>
                                  </Typography>
                                </Box>
                              )}
                              
                              {hasLine2Points && (
                                <Box display="flex" justifyContent="space-between" mt="auto">
                                  <IconButton 
                                    onClick={() => handleChangeDataPoint('line2', 
                                      graphData.line2.focusAreas.findIndex(
                                        area => area.label === item.full
                                      ), -1)}
                                    size="small"
                                    sx={{ p: 0.5 }}
                                  >
                                    <NavigateBeforeIcon fontSize="small" />
                                  </IconButton>
                                  <Typography variant="caption" color="text.secondary">
                                    Change Evaluation
                                  </Typography>
                                  <IconButton 
                                    onClick={() => handleChangeDataPoint('line2', 
                                      graphData.line2.focusAreas.findIndex(
                                        area => area.label === item.full
                                      ), 1)}
                                    size="small"
                                    sx={{ p: 0.5 }}
                                  >
                                    <NavigateNextIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                              
                              {!hasLine2Points && (
                                <Typography variant="caption" color="text.secondary" mt="auto">
                                  Only one evaluation available
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RadarGraph;
