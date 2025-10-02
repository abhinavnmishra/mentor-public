import { Button, TextField, Typography, styled, Box, Paper, alpha } from "@mui/material";

// Professional modernistic color palette with semantic meanings
export const colors = {
  // Primary brand colors
  primary: '#1e40af',      // Deep blue for primary actions
  primaryLight: '#3b82f6', // Lighter blue for hover states
  primaryDark: '#1d4ed8',  // Darker blue for pressed states
  
  // Secondary colors
  secondary: '#6366f1',    // Indigo for secondary actions
  secondaryLight: '#8b5cf6', // Purple for accent
  
  // Semantic colors
  success: '#059669',      // Green for success states
  successLight: '#10b981',
  warning: '#d97706',      // Orange for warnings
  warningLight: '#f59e0b',
  error: '#dc2626',        // Red for errors
  errorLight: '#ef4444',
  info: '#0891b2',         // Cyan for info
  infoLight: '#06b6d4',
  
  // Neutral colors
  background: '#f8fafc',   // Light gray background
  surface: '#ffffff',      // White surface
  surfaceElevated: '#fefefe', // Slightly elevated surface
  
  // Border colors
  border: '#e2e8f0',       // Light border
  borderHover: '#cbd5e1',  // Darker border on hover
  borderFocus: '#94a3b8',  // Focus border
  
  // Text colors
  text: {
    primary: '#0f172a',    // Almost black for primary text
    secondary: '#475569',  // Gray for secondary text
    tertiary: '#64748b',   // Lighter gray for tertiary text
    disabled: '#94a3b8',   // Disabled text
    inverse: '#ffffff'     // White text on dark backgrounds
  },
  
  // Status colors with transparency
  status: {
    draft: '#64748b',      // Gray for draft status
    active: '#059669',     // Green for active
    locked: '#dc2626',     // Red for locked
    pending: '#d97706'     // Orange for pending
  },
  
  // Tool type colors
  tools: {
    text: '#3b82f6',       // Blue for text tools
    media: '#8b5cf6',      // Purple for media tools
    interactive: '#10b981', // Green for interactive tools
    assessment: '#f59e0b'   // Orange for assessment tools
  }
};

// Enhanced button component with better styling and interaction states
export const ActionButton = styled(Button)(({ theme, variant: buttonVariant, color = 'primary' }) => ({
  borderRadius: '10px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '12px 24px',
  minHeight: '44px',
  boxShadow: 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  // Color variants
  ...(buttonVariant === 'contained' && {
    backgroundColor: colors[color] || colors.primary,
    color: colors.text.inverse,
    '&:hover': {
      backgroundColor: colors[`${color}Light`] || colors.primaryLight,
      boxShadow: `0 8px 25px -8px ${alpha(colors[color] || colors.primary, 0.4)}`,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: `0 4px 12px -4px ${alpha(colors[color] || colors.primary, 0.3)}`,
    }
  }),
  
  ...(buttonVariant === 'outlined' && {
    borderColor: colors[color] || colors.primary,
    borderWidth: '1.5px',
    color: colors[color] || colors.primary,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha(colors[color] || colors.primary, 0.05),
      borderWidth: '1.5px',
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px -4px ${alpha(colors[color] || colors.primary, 0.2)}`,
    }
  }),
  
  '&.Mui-disabled': {
    backgroundColor: colors.border,
    color: colors.text.disabled,
    borderColor: colors.border,
    transform: 'none',
    boxShadow: 'none',
  }
}));

// Enhanced text field with modern styling
export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: colors.text.secondary,
    fontWeight: 500,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '&.Mui-focused': {
      color: colors.primary,
    },
    '&.Mui-error': {
      color: colors.error,
    }
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    backgroundColor: colors.surface,
    transition: 'all 0.2s ease-in-out',
    
    '& fieldset': {
      borderColor: colors.border,
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: colors.borderHover,
    },
    '&.Mui-focused': {
      backgroundColor: colors.surfaceElevated,
      '& fieldset': {
        borderColor: colors.primary,
        borderWidth: '2px',
        boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
      }
    },
    '&.Mui-error fieldset': {
      borderColor: colors.error,
    }
  },
  '& .MuiInputBase-input': {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    color: colors.text.primary,
    padding: '14px 16px',
  },
  '& .MuiInputBase-multiline': {
    padding: 0,
  },
  '& .MuiInputBase-inputMultiline': {
    padding: '14px 16px',
  }
}));

// Section title with better hierarchy
export const SectionTitle = styled(Typography)(({ theme, variant = 'h6' }) => ({
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: variant === 'h5' ? '1.25rem' : '1.1rem',
  fontWeight: 700,
  color: colors.text.primary,
  marginBottom: '20px',
  letterSpacing: '-0.025em',
  position: 'relative',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: 0,
    width: '32px',
    height: '3px',
    backgroundColor: colors.primary,
    borderRadius: '2px',
  }
}));

// Modern card component
export const ModernCard = styled(Paper)(({ theme, elevation = 1 }) => ({
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  
  ...(elevation === 1 && {
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderColor: colors.borderHover,
    }
  }),
  
  ...(elevation === 2 && {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '&:hover': {
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }
  })
}));

// Status badge component
export const StatusBadge = styled(Box)(({ theme, status = 'draft' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 600,
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  
  backgroundColor: alpha(colors.status[status] || colors.status.draft, 0.1),
  color: colors.status[status] || colors.status.draft,
  border: `1px solid ${alpha(colors.status[status] || colors.status.draft, 0.2)}`,
}));

// Enhanced container with better spacing
export const Container = styled(Box)(({ theme }) => ({
  padding: '32px',
  maxWidth: '1400px',
  margin: '0 auto',
  minHeight: '100vh',
  backgroundColor: colors.background,
}));

// Tool type indicator
export const ToolTypeIndicator = styled(Box)(({ theme, toolType = 'text' }) => {
  const getToolColor = (type) => {
    if (['TEXT', 'JOURNAL'].includes(type)) return colors.tools.text;
    if (['AUDIO', 'VIDEO', 'IMAGE'].includes(type)) return colors.tools.media;
    if (['CHAT_BOT', 'FILE_UPLOAD'].includes(type)) return colors.tools.interactive;
    if (['MCQ_SINGLE', 'MCQ_MULTISELECT', 'RATING'].includes(type)) return colors.tools.assessment;
    return colors.tools.text;
  };
  
  const toolColor = getToolColor(toolType);
  
  return {
    width: '4px',
    height: '100%',
    backgroundColor: toolColor,
    borderRadius: '2px',
    position: 'absolute',
    left: 0,
    top: 0,
  };
});
