import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  RadioGroup,
  FormControlLabel,
  Radio,
  alpha,
  Chip,
  Divider 
} from '@mui/material';
import { 
  RadioButtonChecked,
  Lock,
  CheckCircle 
} from '@mui/icons-material';
import { 
  colors,
  ToolTypeIndicator 
} from '../ExerciseStyledComponents';

const MCQSingleTool = ({ tool, onChange, readOnly = false }) => {
  // Get options from the options field
  const options = tool.options || [];
  const selectedOption = tool.response || "";

  const handleChange = (event) => {
    if (onChange && !readOnly) {
      onChange(tool.uniqueName, event.target.value);
    }
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
      <ToolTypeIndicator toolType="MCQ_SINGLE" />
      
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
            <RadioButtonChecked sx={{ color: colors.tools.assessment, fontSize: '1.25rem' }} />
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
              Single Choice Question
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Choose one option from the list
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
          {selectedOption && (
            <Chip
              icon={<CheckCircle />}
              label="Answered"
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
        
        <RadioGroup
          name={tool.uniqueName}
          value={selectedOption}
          onChange={handleChange}
          sx={{ gap: 1 }}
        >
          {options.map((option, index) => (
            <Box
              key={index}
              sx={{
                border: `1px solid ${selectedOption === option ? colors.tools.assessment : colors.border}`,
                borderRadius: '12px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: readOnly ? colors.border : colors.tools.assessment,
                  backgroundColor: readOnly ? 'transparent' : alpha(colors.tools.assessment, 0.02),
                },
                ...(selectedOption === option && {
                  backgroundColor: alpha(colors.tools.assessment, 0.05),
                  boxShadow: `0 0 0 3px ${alpha(colors.tools.assessment, 0.1)}`,
                })
              }}
            >
              <FormControlLabel
                value={option}
                control={
                  <Radio 
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
                      fontWeight: selectedOption === option ? 600 : 400,
                      color: selectedOption === option ? colors.text.primary : colors.text.secondary,
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
          ))}
        </RadioGroup>
        
        {selectedOption && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
              <CheckCircle sx={{ color: colors.success, fontSize: '1rem' }} />
              <Typography
                variant="body2"
                sx={{
                  color: colors.success,
                  fontWeight: 600,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Your selection: "{selectedOption}"
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default MCQSingleTool;
