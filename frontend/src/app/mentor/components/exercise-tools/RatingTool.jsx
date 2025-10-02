import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Rating as MuiRating,
  alpha,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  StarRate, 
  StarOutline,
  Lock,
  TrendingUp 
} from '@mui/icons-material';
import { 
  colors,
  ToolTypeIndicator 
} from '../ExerciseStyledComponents';

const RatingTool = ({ tool, onChange, readOnly = false }) => {
  const handleChange = (event, newValue) => {
    if (onChange && !readOnly) {
      onChange(tool.uniqueName, newValue.toString());
    }
  };

  const ratingValue = tool.response ? parseInt(tool.response, 10) : 0;
  
  const getRatingLabel = (value) => {
    const labels = [
      '', 
      'Very Poor', 
      'Poor', 
      'Below Average', 
      'Average', 
      'Above Average', 
      'Good', 
      'Very Good', 
      'Great', 
      'Excellent', 
      'Outstanding'
    ];
    return labels[value] || '';
  };
  
  const getRatingColor = (value) => {
    if (value <= 2) return colors.error;
    if (value <= 4) return colors.warning;
    if (value <= 7) return colors.info;
    return colors.success;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${readOnly ? alpha(colors.border, 0.5) : colors.border}`,
        backgroundColor: readOnly ? alpha(colors.background, 0.3) : colors.surface,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: readOnly ? alpha(colors.border, 0.5) : colors.borderHover,
          boxShadow: readOnly ? 'none' : `0 4px 12px ${alpha(colors.tools.assessment, 0.1)}`,
        }
      }}
    >
      <ToolTypeIndicator toolType="RATING" />
      
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(colors.tools.assessment, 0.05)} 0%, ${alpha(colors.tools.assessment, 0.02)} 100%)`,
          borderBottom: `1px solid ${colors.border}`,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              backgroundColor: alpha(colors.tools.assessment, 0.1),
              borderRadius: '8px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <StarRate sx={{ color: colors.tools.assessment, fontSize: '1.25rem' }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: colors.text.primary,
                fontSize: '1rem'
              }}
            >
              Rating Scale
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Rate from 1 to 10
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          {readOnly && (
            <Chip
              icon={<Lock />}
              label="Read Only"
              size="small"
              variant="outlined"
              sx={{
                borderColor: colors.text.disabled,
                color: colors.text.disabled,
                '& .MuiChip-icon': {
                  color: colors.text.disabled
                }
              }}
            />
          )}
          {ratingValue > 0 && (
            <Chip
              label={getRatingLabel(ratingValue)}
              size="small"
              variant="outlined"
              sx={{
                borderColor: getRatingColor(ratingValue),
                color: getRatingColor(ratingValue)
              }}
            />
          )}
        </Box>
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 4, textAlign: 'center' }}>
        {tool.placeholderText && (
          <>
            <Box
              sx={{
                backgroundColor: alpha(colors.info, 0.05),
                border: `1px solid ${alpha(colors.info, 0.2)}`,
                borderRadius: '12px',
                p: 2,
                mb: 4
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: colors.text.primary,
                  fontWeight: 500,
                  lineHeight: 1.6
                }}
                dangerouslySetInnerHTML={{ __html: tool.placeholderText }}
              />
            </Box>
          </>
        )}
        
        <Box sx={{ position: 'relative', mb: 3 }}>
          <MuiRating
            name={tool.uniqueName}
            value={ratingValue}
            onChange={handleChange}
            precision={1}
            max={10}
            size="large"
            readOnly={readOnly}
            icon={<StarRate fontSize="inherit" />}
            emptyIcon={<StarOutline fontSize="inherit" />}
            sx={{
              fontSize: '2.5rem',
              '& .MuiRating-iconFilled': {
                color: ratingValue > 0 ? getRatingColor(ratingValue) : colors.tools.assessment,
              },
              '& .MuiRating-iconHover': {
                color: colors.tools.assessment,
              },
              '& .MuiRating-iconEmpty': {
                color: alpha(colors.tools.assessment, 0.3),
              },
            }}
          />
          
          {/* Numerical indicators */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 1,
              px: 0.5,
              width: '100%'
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <Box 
                key={num}
                sx={{ 
                  width: '2.5rem', 
                  textAlign: 'center',
                  cursor: readOnly ? 'default' : 'pointer',
                  fontWeight: ratingValue === num ? 700 : 400,
                  color: ratingValue === num ? getRatingColor(num) : colors.text.secondary,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: !readOnly ? colors.tools.assessment : undefined,
                    transform: !readOnly ? 'translateY(-2px)' : undefined
                  }
                }}
                onClick={() => !readOnly && handleChange(null, num)}
              >
                <Tooltip 
                  title={getRatingLabel(num) || `Rating: ${num}`}
                  arrow
                  placement="top"
                >
                  <span>{num}</span>
                </Tooltip>
              </Box>
            ))}
          </Box>
        </Box>
        
        {/* Visual scale with labels */}
        <Box sx={{ mb: 4 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              width: '100%', 
              height: '8px', 
              borderRadius: '4px', 
              mb: 1,
              overflow: 'hidden',
              background: `linear-gradient(to right, 
                ${colors.error} 0%, 
                ${colors.error} 20%, 
                ${colors.warning} 20%, 
                ${colors.warning} 40%, 
                ${colors.info} 40%, 
                ${colors.info} 70%, 
                ${colors.success} 70%, 
                ${colors.success} 100%
              )`,
              position: 'relative'
            }}
          >
            {ratingValue > 0 && (
              <Box 
                sx={{
                  position: 'absolute',
                  left: `calc(${(ratingValue / 10) * 100}% - 10px)`,
                  top: '-6px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: getRatingColor(ratingValue),
                  border: `2px solid ${colors.surface}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.3s ease'
                }}
              />
            )}
          </Box>
          
          {/* Scale labels */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              px: 1
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.error,
                fontWeight: 600
              }}
            >
              Poor
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.warning,
                fontWeight: 600
              }}
            >
              Average
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.info,
                fontWeight: 600
              }}
            >
              Good
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.success,
                fontWeight: 600
              }}
            >
              Excellent
            </Typography>
          </Box>
        </Box>

        {ratingValue > 0 ? (
          <>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: getRatingColor(ratingValue),
                mb: 1
              }}
            >
              {getRatingLabel(ratingValue)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.text.secondary,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {ratingValue} out of 10 stars
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
              <TrendingUp sx={{ color: colors.tools.assessment, fontSize: '1rem' }} />
              <Typography
                variant="body2"
                sx={{
                  color: colors.tools.assessment,
                  fontWeight: 600,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Rating recorded
              </Typography>
            </Box>
          </>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: colors.text.secondary,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontStyle: 'italic'
            }}
          >
            Click on the stars to rate
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default RatingTool;
