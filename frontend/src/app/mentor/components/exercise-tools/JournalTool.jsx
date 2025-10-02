import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  alpha,
  Chip,
  Divider
} from '@mui/material';
import { 
  NoteAlt, 
  Edit,
  Lock
} from '@mui/icons-material';
import { 
  StyledTextField, 
  colors,
  ToolTypeIndicator
} from '../ExerciseStyledComponents';

const JournalTool = ({ tool, onChange, readOnly = false }) => {
  const [wordCount, setWordCount] = useState(0);
  
  const handleChange = (e) => {
    if (onChange && !readOnly) {
      onChange(tool.uniqueName, e.target.value);
      // Update word count
      const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  };

  // Calculate word count on initial render
  React.useEffect(() => {
    if (tool.response) {
      const words = tool.response.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [tool.response]);

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
          boxShadow: readOnly ? 'none' : `0 4px 12px ${alpha(colors.tools.text, 0.1)}`,
        }
      }}
    >
      <ToolTypeIndicator toolType="JOURNAL" />
      
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(colors.tools.text, 0.05)} 0%, ${alpha(colors.tools.text, 0.02)} 100%)`,
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
              backgroundColor: alpha(colors.tools.text, 0.1),
              borderRadius: '8px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <NoteAlt sx={{ color: colors.tools.text, fontSize: '1.25rem' }} />
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
              Journal Entry
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Express your thoughts and reflections
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
            label={`${wordCount} words`}
            size="small"
            variant="outlined"
            color="primary"
          />
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
        
        <StyledTextField
          multiline
          rows={8}
          fullWidth
          placeholder="Start writing your thoughts here... Take your time to reflect deeply on your experiences and insights."
          value={tool.response || ""}
          onChange={handleChange}
          disabled={readOnly}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: readOnly ? alpha(colors.background, 0.3) : colors.surface,
              borderRadius: '12px',
              '& textarea': {
                lineHeight: 1.7,
                fontSize: '0.95rem',
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${alpha(colors.tools.text, 0.1)}`,
              }
            }
          }}
        />
        
        {wordCount > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  color: colors.text.secondary,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Keep writing to capture all your thoughts
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Edit sx={{ color: colors.tools.text, fontSize: '1rem' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.tools.text,
                    fontWeight: 600,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {wordCount} {wordCount === 1 ? 'word' : 'words'} written
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default JournalTool;
