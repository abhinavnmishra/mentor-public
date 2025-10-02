import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  FormGroup,
  FormControlLabel,
  Checkbox,
  alpha,
  Chip,
  Divider 
} from '@mui/material';
import { 
  CheckBox,
  Lock,
  CheckCircle,
  List 
} from '@mui/icons-material';
import { 
  colors,
  ToolTypeIndicator 
} from '../ExerciseStyledComponents';

const MCQMultiTool = ({ tool, onChange, readOnly = false }) => {
  // Get options from the options field
  const options = tool.options || [];

  // Parse selected values from response which is a JSON string of selected options
  const selectedValues = React.useMemo(() => {
    try {
      return new Set(JSON.parse(tool.response || '[]'));
    } catch (e) {
      return new Set();
    }
  }, [tool.response]);

  const handleChange = (option) => (event) => {
    if (onChange && !readOnly) {
      const newSelected = new Set(selectedValues);
      
      if (event.target.checked) {
        newSelected.add(option);
      } else {
        newSelected.delete(option);
      }
      
      onChange(tool.uniqueName, JSON.stringify(Array.from(newSelected)));
    }
  };

  const selectedCount = selectedValues.size;

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
      <ToolTypeIndicator toolType="MCQ_MULTISELECT" />
      
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
            <CheckBox sx={{ color: colors.tools.assessment, fontSize: '1.25rem' }} />
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
              Multiple Choice Question
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Select all options that apply
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
          <Chip
            label={`${options.length} options`}
            size="small"
            variant="outlined"
            color="primary"
          />
          {selectedCount > 0 && (
            <Chip
              icon={<CheckCircle />}
              label={`${selectedCount} selected`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 3 }}>
        {tool.placeholderText && (
          <>
            <Box
              sx={{
                backgroundColor: alpha(colors.info, 0.05),
                border: `1px solid ${alpha(colors.info, 0.2)}`,
                borderRadius: '12px',
                p: 2,
                mb: 3
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
        
        <FormGroup sx={{ gap: 1 }}>
          {options.map((option, index) => {
            const isSelected = selectedValues.has(option);
            return (
              <Box
                key={index}
                sx={{
                  border: `1px solid ${isSelected ? colors.tools.assessment : colors.border}`,
                  borderRadius: '12px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: readOnly ? colors.border : colors.tools.assessment,
                    backgroundColor: readOnly ? 'transparent' : alpha(colors.tools.assessment, 0.02),
                  },
                  ...(isSelected && {
                    backgroundColor: alpha(colors.tools.assessment, 0.05),
                    boxShadow: `0 0 0 3px ${alpha(colors.tools.assessment, 0.1)}`,
                  })
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={isSelected}
                      onChange={handleChange(option)}
                      disabled={readOnly}
                      sx={{
                        color: colors.text.secondary,
                        '&.Mui-checked': {
                          color: colors.tools.assessment,
                        },
                        '&:hover': {
                          backgroundColor: alpha(colors.tools.assessment, 0.1),
                        }
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? colors.text.primary : colors.text.secondary,
                        padding: '8px 0',
                      }}
                    >
                      {option}
                    </Typography>
                  }
                  sx={{
                    margin: 0,
                    padding: '12px 16px',
                    width: '100%',
                    '&.Mui-disabled': {
                      opacity: 0.7,
                    },
                  }}
                />
              </Box>
            );
          })}
        </FormGroup>
        
        {selectedCount > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
                <List sx={{ color: colors.tools.assessment, fontSize: '1rem' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.tools.assessment,
                    fontWeight: 600,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {selectedCount} option{selectedCount > 1 ? 's' : ''} selected
                </Typography>
              </Box>
              
              <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                {Array.from(selectedValues).map((value, index) => (
                  <Chip
                    key={index}
                    label={value}
                    size="small"
                    color="success"
                    variant="outlined"
                    icon={<CheckCircle />}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default MCQMultiTool;
