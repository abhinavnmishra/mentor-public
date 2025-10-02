import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Menu,
  Chip,
  alpha,
  styled,
  Stack,
  Divider,
  Card,
  Tooltip,
  Badge
} from "@mui/material";
import { Editor } from '@tinymce/tinymce-react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Add,
  Delete,
  TextFields,
  StarRate,
  CheckBox,
  RadioButtonChecked,
  Upload,
  NoteAlt,
  Chat,
  Mic,
  VideoCall,
  DragIndicator,
  Extension,
  SmartToy,
  Assessment,
  Settings,
  ChatBubbleOutline
} from "@mui/icons-material";
import { 
  ActionButton, 
  StyledTextField, 
  SectionTitle, 
  ModernCard,
  ToolTypeIndicator,
  colors 
} from "./ExerciseStyledComponents";

// Enhanced tool card with better visual design and tool type indicators
const ToolCard = styled(ModernCard)(({ theme, isDragging, toolType }) => {
  const getToolColor = (type) => {
    if (['TEXT', 'JOURNAL'].includes(type)) return colors.tools.text;
    if (['AUDIO', 'VIDEO', 'IMAGE'].includes(type)) return colors.tools.media;
    if (['CHAT_BOT', 'FILE_UPLOAD'].includes(type)) return colors.tools.interactive;
    if (['MCQ_SINGLE', 'MCQ_MULTISELECT', 'RATING'].includes(type)) return colors.tools.assessment;
    return colors.tools.text;
  };
  
  const toolColor = getToolColor(toolType);
  
  // Get tool-specific background patterns
  const getToolPattern = (type) => {
    if (type === 'CHAT_BOT') {
      return {
        backgroundImage: `radial-gradient(${alpha(toolColor, 0.1)} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      };
    }
    if (type === 'MCQ_SINGLE' || type === 'MCQ_MULTISELECT') {
      return {
        backgroundImage: `linear-gradient(45deg, ${alpha(toolColor, 0.05)} 25%, transparent 25%, transparent 50%, ${alpha(toolColor, 0.05)} 50%, ${alpha(toolColor, 0.05)} 75%, transparent 75%, transparent)`,
        backgroundSize: '10px 10px',
      };
    }
    if (type === 'JOURNAL') {
      return {
        backgroundImage: `linear-gradient(0deg, transparent calc(100% - 1px), ${alpha(toolColor, 0.2)} calc(100% - 1px))`,
        backgroundSize: '100% 24px',
      };
    }
    return {};
  };
  
  const toolPattern = getToolPattern(toolType);
  
  return {
    borderRadius: '16px',
    border: `1px solid ${isDragging ? toolColor : colors.border}`,
    boxShadow: isDragging 
      ? `0 20px 25px -5px ${alpha(toolColor, 0.2)}, 0 10px 10px -5px ${alpha(toolColor, 0.1)}`
      : '0 4px 12px rgba(0, 0, 0, 0.05)',
    background: isDragging 
      ? `linear-gradient(135deg, ${alpha(toolColor, 0.05)} 0%, ${colors.surface} 100%)`
      : colors.surface,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: '24px',
    margin: '0 0 28px 0',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    position: 'relative',
    overflow: 'visible',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '6px',
      backgroundColor: toolColor,
      borderRadius: '0 4px 4px 0',
    },
    
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: 0,
      width: '70%',
      height: '100%',
      borderRadius: '0 16px 16px 0',
      opacity: 0.4,
      zIndex: 0,
      pointerEvents: 'none',
      ...toolPattern
    },
    
    '&:hover': {
      boxShadow: `0 12px 28px -8px ${alpha(toolColor, 0.25)}`,
      borderColor: alpha(toolColor, 0.4),
      transform: 'translateY(-3px)',
    }
  };
});

// Enhanced tool type button with better categorization
const ToolTypeButton = styled(ActionButton)(({ theme, toolType }) => {
  const getToolColor = (type) => {
    if (['TEXT', 'JOURNAL'].includes(type)) return colors.tools.text;
    if (['AUDIO', 'VIDEO', 'IMAGE'].includes(type)) return colors.tools.media;
    if (['CHAT_BOT', 'FILE_UPLOAD'].includes(type)) return colors.tools.interactive;
    if (['MCQ_SINGLE', 'MCQ_MULTISELECT', 'RATING'].includes(type)) return colors.tools.assessment;
    return colors.tools.text;
  };
  
  const toolColor = getToolColor(toolType);
  
  return {
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.75rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '16px 12px',
    minWidth: '140px',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: alpha(toolColor, 0.1),
    color: toolColor,
    border: `1.5px solid ${alpha(toolColor, 0.2)}`,
    boxShadow: 'none',
    position: 'relative',
    overflow: 'hidden',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      backgroundColor: toolColor,
    },
    
    '&:hover': {
      backgroundColor: alpha(toolColor, 0.15),
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 16px -8px ${alpha(toolColor, 0.4)}`,
    }
  };
});

const DroppableContainer = styled(Box)(({ theme, isDraggingOver }) => ({
  padding: '20px',
  width: '100%',
  minHeight: '300px',
  background: isDraggingOver 
    ? `linear-gradient(135deg, ${alpha(colors.primary, 0.08)} 0%, ${alpha(colors.primaryLight, 0.05)} 100%)`
    : 'transparent',
  borderRadius: '16px',
  border: isDraggingOver 
    ? `2px dashed ${colors.primary}`
    : `2px dashed transparent`,
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  
  '&::before': isDraggingOver ? {
    content: '"Drop tools here"',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: colors.text.inverse,
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: 600,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    zIndex: 10,
    pointerEvents: 'none',
  } : {}
}));

const DragHandle = styled(Box)(({ theme, toolType }) => {
  const getToolColor = (type) => {
    if (['TEXT', 'JOURNAL'].includes(type)) return colors.tools.text;
    if (['AUDIO', 'VIDEO', 'IMAGE'].includes(type)) return colors.tools.media;
    if (['CHAT_BOT', 'FILE_UPLOAD'].includes(type)) return colors.tools.interactive;
    if (['MCQ_SINGLE', 'MCQ_MULTISELECT', 'RATING'].includes(type)) return colors.tools.assessment;
    return colors.tools.text;
  };
  
  const toolColor = getToolColor(toolType);
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    backgroundColor: alpha(toolColor, 0.1),
    color: toolColor,
    cursor: 'grab',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid ${alpha(toolColor, 0.2)}`,
    position: 'relative',
    zIndex: 1,
    
    '&:hover': {
      backgroundColor: alpha(toolColor, 0.2),
      transform: 'scale(1.05)',
      borderColor: toolColor,
    },
    '&:active': {
      cursor: 'grabbing',
      transform: 'scale(0.95)',
    }
  };
});

const EditorContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: colors.surface,
  transition: 'all 0.2s ease-in-out',
  marginBottom: '16px',
  
  '&:focus-within': {
    borderColor: colors.primary,
    boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
  },
  
  '& .tox-tinymce': {
    border: 'none !important',
  },
  '& .tox-statusbar__resize-handle': {
    display: 'block !important',
  },
  '& .tox-statusbar': {
    border: 'none !important',
    backgroundColor: colors.background,
  }
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 40px',
  textAlign: 'center',
  background: `linear-gradient(135deg, ${alpha(colors.background, 0.8)} 0%, ${colors.surface} 100%)`,
  borderRadius: '20px',
  border: `2px dashed ${colors.border}`,
  minHeight: '300px',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 20,
    right: 20,
    width: '60px',
    height: '60px',
    background: `radial-gradient(circle, ${alpha(colors.primary, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
  }
}));

const ToolHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.05)} 100%)`,
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.primary, 0.15)}`,
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: `radial-gradient(circle, ${alpha(colors.primary, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
    transform: 'translate(30%, -30%)',
  }
}));

const ToolCategorySection = styled(Box)(({ theme }) => ({
  marginBottom: '16px',
  
  '& .category-title': {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
    color: colors.text.secondary,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }
}));

// Enhanced tool type configuration with categories
const toolTypeConfig = {
  TEXT: {
    icon: <TextFields />,
    label: "Text Field",
    category: "text",
    description: "Short text input"
  },
  JOURNAL: {
    icon: <NoteAlt />,
    label: "Journal",
    category: "text", 
    description: "Long form writing"
  },
  MCQ_SINGLE: {
    icon: <RadioButtonChecked />,
    label: "Single Choice",
    category: "assessment",
    description: "Choose one option"
  },
  MCQ_MULTISELECT: {
    icon: <CheckBox />,
    label: "Multiple Choice", 
    category: "assessment",
    description: "Choose multiple options"
  },
  RATING: {
    icon: <StarRate />,
    label: "Rating",
    category: "assessment",
    description: "Rate or score items"
  },
  CHAT_BOT: {
    icon: <Chat />,
    label: "Chat Bot",
    category: "interactive",
    description: "AI conversation"
  },
  FILE_UPLOAD: {
    icon: <Upload />,
    label: "File Upload",
    category: "interactive", 
    description: "Upload documents"
  },
  AUDIO: {
    icon: <Mic />,
    label: "Audio",
    category: "media",
    description: "Voice recording"
  },
  VIDEO: {
    icon: <VideoCall />,
    label: "Video",
    category: "media",
    description: "Video recording"
  }
};

const toolCategories = {
  text: {
    label: "Text & Writing",
    icon: <TextFields />,
    color: colors.tools.text
  },
  assessment: {
    label: "Assessments",
    icon: <Assessment />,
    color: colors.tools.assessment
  },
  interactive: {
    label: "Interactive",
    icon: <SmartToy />,
    color: colors.tools.interactive
  },
  media: {
    label: "Media",
    icon: <Mic />,
    color: colors.tools.media
  }
};

const ExerciseToolManager = ({
  tools,
  onAddTool,
  onDeleteTool,
  onUpdateTool,
  onReorderTools,
  disabled = false
}) => {
  const [toolTypeMenuAnchor, setToolTypeMenuAnchor] = useState(null);

  const handleOpenToolTypeMenu = (event) => {
    setToolTypeMenuAnchor(event.currentTarget);
  };

  const handleCloseToolTypeMenu = () => {
    setToolTypeMenuAnchor(null);
  };

  const handleAddTool = (toolType) => {
    onAddTool(toolType);
    handleCloseToolTypeMenu();
  };

  const handleDragEnd = (result) => {
    if (!result.destination || disabled) return;
    onReorderTools(result.source.index, result.destination.index);
  };

  return (
    <Box>
      {/* Enhanced Tool Header */}
      <ToolHeader>
        <Box position="relative" zIndex={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <SectionTitle variant="h6" sx={{ mb: 1, '&::after': { display: 'none' } }}>
                <Extension sx={{ fontSize: '1.2rem', mr: 1, color: colors.primary }} />
                Input Tools
              </SectionTitle>
              <Typography
                variant="body2"
                sx={{
                  color: colors.text.secondary,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Add interactive tools to collect responses from coachees
              </Typography>
            </Box>
            <ActionButton
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenToolTypeMenu}
              disabled={disabled}
            >
              Add Tool
            </ActionButton>
          </Stack>
          
          {/* Tool Stats */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              icon={<Extension />}
              label={`${tools.length} ${tools.length === 1 ? 'Tool' : 'Tools'}`}
              size="small"
              sx={{
                backgroundColor: alpha(colors.primary, 0.1),
                color: colors.primary,
                border: `1px solid ${alpha(colors.primary, 0.2)}`,
                fontWeight: 600,
              }}
            />
            {tools.length > 0 && (
              <Chip
                icon={<Settings />}
                label="Configure Tools"
                size="small"
                sx={{
                  backgroundColor: alpha(colors.secondary, 0.1),
                  color: colors.secondary,
                  border: `1px solid ${alpha(colors.secondary, 0.2)}`,
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
        </Box>
      </ToolHeader>

      {/* Enhanced Tool Type Menu */}
      <Menu
        anchorEl={toolTypeMenuAnchor}
        open={Boolean(toolTypeMenuAnchor)}
        onClose={handleCloseToolTypeMenu}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            maxWidth: '600px',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 700,
              color: colors.text.primary,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Extension sx={{ color: colors.primary }} />
            Choose Tool Type
          </Typography>
          
          {Object.entries(toolCategories).map(([categoryKey, category]) => (
            <ToolCategorySection key={categoryKey}>
              <Typography className="category-title" sx={{ color: category.color }}>
                {category.icon} {category.label}
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(toolTypeConfig)
                  .filter(([_, config]) => config.category === categoryKey)
                  .map(([type, config]) => (
                    <Grid item xs={6} sm={4} key={type}>
                      <ToolTypeButton
                        fullWidth
                        onClick={() => handleAddTool(type)}
                        toolType={type}
                        sx={{ height: '100%' }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          {config.icon}
                          <Typography variant="caption" fontWeight={600}>
                            {config.label}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                            {config.description}
                          </Typography>
                        </Box>
                      </ToolTypeButton>
                    </Grid>
                  ))}
              </Grid>
            </ToolCategorySection>
          ))}
        </Box>
      </Menu>
      
      {/* Enhanced Drag & Drop Area */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tools">
          {(provided, snapshot) => (
            <DroppableContainer
              {...provided.droppableProps}
              ref={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}
            >
              {tools.length === 0 ? (
                <EmptyState>
                  <Extension sx={{ fontSize: '3rem', color: colors.text.disabled, mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontWeight: 700,
                      color: colors.text.secondary,
                      fontSize: '1.25rem',
                      marginBottom: '12px'
                    }}
                  >
                    No Input Tools Yet
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: colors.text.disabled,
                      fontSize: '0.875rem',
                      maxWidth: '400px',
                      lineHeight: 1.6
                    }}
                  >
                    Create interactive experiences by adding input tools. Choose from text fields, assessments, media tools, and more to collect meaningful responses from your coachees.
                  </Typography>
                  <ActionButton
                    variant="outlined"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleOpenToolTypeMenu}
                    disabled={disabled}
                    sx={{ mt: 3 }}
                  >
                    Add Your First Tool
                  </ActionButton>
                </EmptyState>
              ) : (
                tools.map((tool, index) => (
                  <Draggable key={tool.uniqueName} draggableId={tool.uniqueName} index={index}>
                    {(provided, snapshot) => (
                      <ToolCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        isDragging={snapshot.isDragging}
                        toolType={tool.toolType}
                      >
                        <DragHandle 
                          {...(disabled ? {} : provided.dragHandleProps)} 
                          toolType={tool.toolType}
                          sx={{
                            cursor: disabled ? 'default' : 'grab',
                            opacity: disabled ? 0.5 : 1,
                          }}
                        >
                          {toolTypeConfig[tool.toolType]?.icon || <DragIndicator sx={{ fontSize: '24px' }} />}
                        </DragHandle>
                        
                        <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Chip
                                  icon={toolTypeConfig[tool.toolType]?.icon}
                                  label={toolTypeConfig[tool.toolType]?.label}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(toolTypeConfig[tool.toolType] ? 
                                      toolCategories[toolTypeConfig[tool.toolType].category]?.color : colors.primary, 0.1),
                                    color: toolTypeConfig[tool.toolType] ? 
                                      toolCategories[toolTypeConfig[tool.toolType].category]?.color : colors.primary,
                                    border: `1px solid ${alpha(toolTypeConfig[tool.toolType] ? 
                                      toolCategories[toolTypeConfig[tool.toolType].category]?.color : colors.primary, 0.2)}`,
                                    fontWeight: 600,
                                    padding: '4px 8px',
                                    height: 'auto',
                                    '& .MuiChip-label': {
                                      padding: '2px 0',
                                    },
                                    '& .MuiChip-icon': {
                                      marginLeft: '4px',
                                    }
                                  }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Badge 
                                    badgeContent={index + 1} 
                                    color="primary"
                                    sx={{
                                      '& .MuiBadge-badge': {
                                        backgroundColor: colors.secondary,
                                        color: colors.text.inverse,
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                      }
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: colors.text.secondary,
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 500,
                                      }}
                                    >
                                      {tool.uniqueName}
                                    </Typography>
                                  </Badge>
                                  {tool.toolType === 'CHAT_BOT' && tool.maxChatCount && (
                                    <Chip
                                      size="small"
                                      label={`Max ${tool.maxChatCount} exchanges`}
                                      sx={{
                                        height: '20px',
                                        fontSize: '0.65rem',
                                        backgroundColor: alpha(colors.tools.interactive, 0.1),
                                        color: colors.tools.interactive,
                                        border: `1px solid ${alpha(colors.tools.interactive, 0.2)}`,
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Stack>
                            
                            <Tooltip title="Delete Tool">
                              <IconButton 
                                color="error"
                                onClick={() => onDeleteTool(index)}
                                disabled={disabled}
                                sx={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '12px',
                                  backgroundColor: alpha(colors.error, 0.1),
                                  border: `1px solid ${alpha(colors.error, 0.2)}`,
                                  '&:hover': {
                                    backgroundColor: alpha(colors.error, 0.2),
                                    transform: 'scale(1.05)',
                                  },
                                  '&.Mui-disabled': {
                                    backgroundColor: alpha(colors.text.disabled, 0.1),
                                    color: colors.text.disabled
                                  }
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          
                          <StyledTextField
                            label="Instructions for Coachees"
                            fullWidth
                            multiline
                            minRows={2}
                            maxRows={6}
                            value={tool.placeholderText}
                            onChange={(e) => onUpdateTool(index, 'placeholderText', e.target.value)}
                            placeholder="Provide clear instructions for what coachees should do with this tool..."
                            sx={{ 
                              mb: 3,
                              '& .MuiInputBase-root': {
                                transition: 'all 0.2s ease-in-out',
                              },
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: alpha(colors.background, 0.5),
                              },
                              '& .MuiOutlinedInput-root:hover': {
                                backgroundColor: alpha(colors.background, 0.8),
                              },
                              '& .MuiOutlinedInput-root.Mui-focused': {
                                backgroundColor: colors.surface,
                              }
                            }}
                            disabled={disabled}
                          />
                          
                          {tool.toolType === 'CHAT_BOT' && (
                            <Box sx={{ 
                              backgroundColor: alpha(colors.tools.interactive, 0.05), 
                              borderRadius: '12px', 
                              p: 3, 
                              mb: 3,
                              border: `1px solid ${alpha(colors.tools.interactive, 0.15)}`,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                mb: 2,
                                color: colors.tools.interactive,
                                fontWeight: 600,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}>
                                <Chat sx={{ fontSize: '1.1rem' }} />
                                <Typography variant="subtitle2" fontWeight={600}>
                                  Chatbot Configuration
                                </Typography>
                              </Box>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    mb: 1, 
                                    fontWeight: 600, 
                                    color: colors.text.secondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <SmartToy sx={{ fontSize: '1rem' }} />
                                  AI Chatbot Instructions
                                </Typography>
                                <EditorContainer>
                                  <Editor
                                    tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                                    value={tool.chatBotInstructions || ''}
                                    onEditorChange={(content) => onUpdateTool(index, 'chatBotInstructions', content)}
                                    disabled={disabled}
                                    init={{
                                      height: 200,
                                      menubar: false,
                                      plugins: [
                                        'lists', 'link', 'autolink', 'autoresize'
                                      ],
                                      toolbar: 'undo redo | formatselect | ' +
                                        'bold italic | bullist numlist | ' +
                                        'removeformat',
                                      formats: {
                                        h1: { block: 'h1' },
                                        h2: { block: 'h2' },
                                        h3: { block: 'h3' },
                                        p: { block: 'p' }
                                      },
                                      content_style: 'body { font-family:"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size:14px; line-height: 1.6; padding: 16px; }',
                                      branding: false,
                                      promotion: false,
                                      resize: 'vertical',
                                      autoresize_min_height: 180,
                                      autoresize_max_height: 400,
                                      statusbar: true,
                                      elementpath: false,
                                      placeholder: "Define the AI's personality, knowledge scope, and conversation guidelines..."
                                    }}
                                  />
                                </EditorContainer>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <StyledTextField
                                  label="Maximum Chat Exchanges"
                                  type="number"
                                  value={tool.maxChatCount || ""}
                                  onChange={(e) => onUpdateTool(index, 'maxChatCount', parseInt(e.target.value) || null)}
                                  placeholder="Leave empty for unlimited"
                                  disabled={disabled}
                                  InputProps={{ 
                                    inputProps: { min: 1 },
                                    startAdornment: (
                                      <Box sx={{ 
                                        mr: 1, 
                                        color: colors.tools.interactive,
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}>
                                        <Chat sx={{ fontSize: '1rem' }} />
                                      </Box>
                                    )
                                  }}
                                  sx={{ 
                                    width: '250px',
                                    '& .MuiInputBase-root': {
                                      transition: 'all 0.2s ease-in-out',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                      backgroundColor: alpha(colors.background, 0.7),
                                    }
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: colors.text.secondary, flex: 1 }}>
                                  {tool.maxChatCount ? `Limit coachee to ${tool.maxChatCount} message exchanges with the AI` : 'No limit on chat exchanges'}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          
                          {(tool.toolType === 'MCQ_SINGLE' || tool.toolType === 'MCQ_MULTISELECT') && (
                            <Box sx={{ 
                              backgroundColor: alpha(colors.tools.assessment, 0.05), 
                              borderRadius: '12px', 
                              p: 3, 
                              mb: 3,
                              border: `1px solid ${alpha(colors.tools.assessment, 0.15)}`,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mb: 3
                              }}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1,
                                  color: colors.tools.assessment,
                                  fontWeight: 600,
                                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                }}>
                                  {tool.toolType === 'MCQ_SINGLE' ? 
                                    <RadioButtonChecked sx={{ fontSize: '1.1rem' }} /> : 
                                    <CheckBox sx={{ fontSize: '1.1rem' }} />
                                  }
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {tool.toolType === 'MCQ_SINGLE' ? 'Single Choice' : 'Multiple Choice'} Options
                                  </Typography>
                                </Box>
                                
                                <Chip
                                  size="small"
                                  label={`${tool.options?.length || 0} options`}
                                  sx={{
                                    backgroundColor: alpha(colors.tools.assessment, 0.1),
                                    color: colors.tools.assessment,
                                    border: `1px solid ${alpha(colors.tools.assessment, 0.2)}`,
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                              
                              <Box sx={{ 
                                maxHeight: '300px', 
                                overflowY: 'auto', 
                                pr: 1,
                                mb: 2,
                                '&::-webkit-scrollbar': {
                                  width: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                  backgroundColor: alpha(colors.background, 0.5),
                                  borderRadius: '10px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  backgroundColor: alpha(colors.tools.assessment, 0.3),
                                  borderRadius: '10px',
                                  '&:hover': {
                                    backgroundColor: alpha(colors.tools.assessment, 0.5),
                                  }
                                }
                              }}>
                                {tool.options?.map((option, optionIndex) => (
                                  <Stack 
                                    key={optionIndex} 
                                    direction="row" 
                                    spacing={2} 
                                    alignItems="center" 
                                    sx={{ 
                                      mb: 2,
                                      p: 1.5,
                                      borderRadius: '8px',
                                      border: `1px solid ${alpha(colors.border, 0.5)}`,
                                      backgroundColor: alpha(colors.background, 0.5),
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        backgroundColor: alpha(colors.background, 0.8),
                                        borderColor: alpha(colors.tools.assessment, 0.3),
                                      }
                                    }}
                                  >
                                    <Box sx={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: tool.toolType === 'MCQ_SINGLE' ? '50%' : '6px',
                                      backgroundColor: alpha(colors.tools.assessment, 0.1),
                                      border: `1px solid ${alpha(colors.tools.assessment, 0.3)}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      color: colors.tools.assessment,
                                    }}>
                                      {tool.toolType === 'MCQ_SINGLE' ? 
                                        <RadioButtonChecked sx={{ fontSize: '16px' }} /> : 
                                        <CheckBox sx={{ fontSize: '16px' }} />
                                      }
                                    </Box>
                                    <StyledTextField
                                      fullWidth
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(tool.options || [])];
                                        newOptions[optionIndex] = e.target.value;
                                        onUpdateTool(index, 'options', newOptions);
                                      }}
                                      placeholder={`Option ${optionIndex + 1}`}
                                      size="small"
                                      disabled={disabled}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          backgroundColor: colors.surface,
                                        }
                                      }}
                                    />
                                    <Tooltip title="Remove Option">
                                      <IconButton
                                        color="error"
                                        onClick={() => {
                                          const newOptions = [...(tool.options || [])];
                                          newOptions.splice(optionIndex, 1);
                                          onUpdateTool(index, 'options', newOptions);
                                        }}
                                        disabled={disabled || tool.options.length <= 2}
                                        sx={{
                                          width: '36px',
                                          height: '36px',
                                          borderRadius: '8px',
                                          backgroundColor: alpha(colors.error, 0.1),
                                          '&:hover': {
                                            backgroundColor: alpha(colors.error, 0.2),
                                          },
                                          '&.Mui-disabled': {
                                            backgroundColor: alpha(colors.text.disabled, 0.1),
                                            color: colors.text.disabled
                                          }
                                        }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                ))}
                              </Box>
                              
                              <ActionButton
                                variant="outlined"
                                size="small"
                                startIcon={<Add />}
                                onClick={() => {
                                  const newOptions = [...(tool.options || []), ''];
                                  onUpdateTool(index, 'options', newOptions);
                                }}
                                disabled={disabled}
                                color="primary"
                                sx={{ 
                                  mt: 1,
                                  borderColor: alpha(colors.tools.assessment, 0.3),
                                  color: colors.tools.assessment,
                                  '&:hover': {
                                    borderColor: colors.tools.assessment,
                                    backgroundColor: alpha(colors.tools.assessment, 0.05),
                                  }
                                }}
                              >
                                Add Option
                              </ActionButton>
                              
                              {tool.options?.length < 2 && (
                                <Typography variant="caption" sx={{ display: 'block', color: colors.warning, mt: 1 }}>
                                  At least 2 options are required
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </ToolCard>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </DroppableContainer>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default ExerciseToolManager;
