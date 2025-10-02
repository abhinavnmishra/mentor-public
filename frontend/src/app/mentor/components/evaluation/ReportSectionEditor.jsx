import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  alpha,
  styled,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit,
  Image,
  Delete,
  Upload,
  Visibility,
  Close
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';
import { useAxios } from '../../../contexts/AxiosContext';
import { useAlert } from '../../../contexts/AlertContext';

// Modern color palette
const colors = {
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8'
  }
};

const SectionHeader = styled(Box)(({ theme }) => ({
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: `1px solid ${colors.border}`,
}));

const EditableTitle = styled(TextField)(({ theme }) => ({
  '& .MuiInput-root': {
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.text.primary,
    '&:before': {
      display: 'none',
    },
    '&:after': {
      borderBottom: `2px solid ${colors.primary}`,
    },
  },
  '& .MuiInput-input': {
    padding: '4px 0',
  }
}));

const EditorContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  overflow: 'hidden',
  marginBottom: '16px',
  '& .tox-tinymce': {
    border: 'none !important',
  },
  '& .tox-statusbar__resize-handle': {
    display: 'block !important',
  },
  '& .tox-statusbar': {
    border: 'none !important',
  }
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  marginBottom: '16px',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  display: 'flex',
  gap: '4px',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  '.image-container:hover &': {
    opacity: 1,
  }
}));

const OverlayButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(colors.surface, 0.9),
  backdropFilter: 'blur(4px)',
  border: `1px solid ${colors.border}`,
  '&:hover': {
    backgroundColor: colors.surface,
  }
}));

const ImageUploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${colors.border}`,
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  marginBottom: '16px',
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  }
}));

export default function ReportSectionEditor({ section, sectionIndex, onUpdateSection }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const fileInputRef = useRef(null);
  const axiosInstance = useAxios();
  const { showAlert } = useAlert();
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  // Handle title editing
  const handleTitleClick = () => {
    setEditingTitle(true);
  };

  const handleTitleChange = (event) => {
    onUpdateSection({
      ...section,
      title: event.target.value
    });
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setEditingTitle(false);
    }
  };

  // Handle content editing
  const handleContentChange = (content) => {
    onUpdateSection({
      ...section,
      content: content
    });
  };

  // Handle image title editing
  const handleImageTitleChange = (event) => {
    onUpdateSection({
      ...section,
      imageTitle: event.target.value
    });
  };

  // Handle image upload
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/public/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const assetId = response.data;
      
      onUpdateSection({
        ...section,
        imageUrl: assetId,
        imageTitle: section.imageTitle || `Image for ${section.title}`
      });

      showAlert('Image uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  // Handle image removal
  const handleImageRemove = () => {
    onUpdateSection({
      ...section,
      imageUrl: null,
      imageTitle: ''
    });
  };

  // Handle image preview
  const handleImagePreview = () => {
    setImagePreviewOpen(true);
  };

  const handleImagePreviewClose = () => {
    setImagePreviewOpen(false);
  };

  return (
    <Box>
      {/* Section Title */}
      <SectionHeader>
        {editingTitle ? (
          <EditableTitle
            variant="standard"
            value={section.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            fullWidth
          />
        ) : (
          <Box 
            display="flex" 
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={handleTitleClick}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: colors.text.primary,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                flex: 1,
              }}
            >
              {section.title}
            </Typography>
            <Tooltip title="Click to edit title">
              <IconButton size="small" sx={{ opacity: 0.7 }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </SectionHeader>

      {/* Section Image */}
      {section.imageUrl ? (
        <ImageContainer className="image-container">
          <img
            src={`${backendBaseUrl}/public/${section.imageUrl}`}
            alt={section.imageTitle || section.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '400px',
              objectFit: 'contain',
              display: 'block'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
            }}
          />
          
          <ImageOverlay>
            <Tooltip title="Preview Image">
              <OverlayButton size="small" onClick={handleImagePreview}>
                <Visibility fontSize="small" />
              </OverlayButton>
            </Tooltip>
            <Tooltip title="Remove Image">
              <OverlayButton size="small" onClick={handleImageRemove}>
                <Delete fontSize="small" sx={{ color: colors.error }} />
              </OverlayButton>
            </Tooltip>
          </ImageOverlay>

          {/* Image Title */}
          <Box sx={{ p: 2, backgroundColor: alpha(colors.background, 0.8) }}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Image caption/title..."
              value={section.imageTitle || ''}
              onChange={handleImageTitleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: colors.surface,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }
              }}
            />
          </Box>
        </ImageContainer>
      ) : (
        <ImageUploadArea onClick={handleImageUpload}>
          {uploading ? (
            <>
              <CircularProgress sx={{ color: colors.primary, mb: 1 }} />
              <Typography variant="body2" color={colors.text.primary}>
                Uploading image...
              </Typography>
            </>
          ) : (
            <>
              <Image sx={{ fontSize: '3rem', color: colors.text.disabled, mb: 1 }} />
              <Typography
                variant="body1"
                sx={{
                  color: colors.primary,
                  fontWeight: 600,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  mb: 0.5
                }}
              >
                Add Image to Section
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.text.secondary,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Click to upload an image for this section
              </Typography>
            </>
          )}
        </ImageUploadArea>
      )}

      {/* Upload Error */}
      {uploadError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: '8px',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
          onClose={() => setUploadError('')}
        >
          {uploadError}
        </Alert>
      )}

      {/* Section Content Editor */}
      <EditorContainer>
        <Editor
          tinymceScriptSrc={'/tinymce/tinymce.min.js'}
          value={section.content || ''}
          onEditorChange={handleContentChange}
          init={{
            height: 300,
            menubar: false,
            plugins: [
              'lists', 'link', 'autolink', 'autoresize', 'table'
            ],
            toolbar: 'undo redo | formatselect | ' +
              'bold italic underline | bullist numlist | ' +
              'link table | removeformat',
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
            autoresize_min_height: 300,
            autoresize_max_height: 600,
            statusbar: true,
            elementpath: false,
            placeholder: 'Enter section content...'
          }}
        />
      </EditorContainer>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*"
        disabled={uploading}
      />

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreviewOpen}
        onClose={handleImagePreviewClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Image Preview
          <IconButton onClick={handleImagePreviewClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {section.imageUrl && (
            <Box>
              <img
                src={`${backendBaseUrl}/public/${section.imageUrl}`}
                alt={section.imageTitle || section.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}
              />
              {section.imageTitle && (
                <Box sx={{ p: 2, backgroundColor: alpha(colors.background, 0.8) }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: colors.text.secondary,
                      textAlign: 'center'
                    }}
                  >
                    {section.imageTitle}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleImagePreviewClose} 
            variant="contained" 
            color="primary"
            sx={{ 
              textTransform: 'none',
              borderRadius: '8px',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Close
          </Button>
          <Button 
            component="a"
            href={section.imageUrl ? `${backendBaseUrl}/public/${section.imageUrl}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined" 
            color="primary"
            sx={{ 
              textTransform: 'none',
              borderRadius: '8px',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Open in New Tab
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
