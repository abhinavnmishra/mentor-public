import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  alpha,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Card,
  Chip,
  LinearProgress,
  Divider,
  styled
} from "@mui/material";
import {
  AttachFile,
  InsertDriveFile,
  PictureAsPdf,
  Description,
  Delete,
  Upload,
  Image,
  AutoAwesome,
  Visibility,
  FileOpen,
  CloudUpload,
  Folder,
  GetApp
} from "@mui/icons-material";
import { 
  ActionButton, 
  ModernCard,
  colors 
} from "./ExerciseStyledComponents";
import { useAxios } from "../../contexts/AxiosContext";
import { useAlert } from "../../contexts/AlertContext";

// Enhanced styled components for modern file upload interface
const UploadZone = styled(Box)(({ theme, isDragging, isUploading }) => ({
  border: `2px dashed ${isDragging ? colors.primary : colors.border}`,
  borderRadius: '16px',
  padding: '40px 24px',
  textAlign: 'center',
  backgroundColor: isDragging 
    ? alpha(colors.primary, 0.05)
    : isUploading 
      ? alpha(colors.info, 0.05) 
      : colors.surface,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: isUploading ? 'not-allowed' : 'pointer',
  position: 'relative',
  overflow: 'hidden',
  
  '&:hover': !isUploading && {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.02),
  },
  
  '&::before': isDragging ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at center, ${alpha(colors.primary, 0.1)} 0%, transparent 70%)`,
    borderRadius: '16px',
    zIndex: 0,
  } : {}
}));

const FileCard = styled(ModernCard)(({ theme, fileType }) => {
  const getFileTypeColor = (type) => {
    if (type === 'image') return colors.secondary;
    return colors.info;
  };
  
  const fileColor = getFileTypeColor(fileType);
  
  return {
    padding: '16px',
    borderRadius: '12px',
    border: `1px solid ${alpha(fileColor, 0.2)}`,
    backgroundColor: alpha(fileColor, 0.05),
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      backgroundColor: fileColor,
      borderRadius: '0 4px 4px 0',
    },
    
    '&:hover': {
      borderColor: alpha(fileColor, 0.4),
      backgroundColor: alpha(fileColor, 0.08),
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px -8px ${alpha(fileColor, 0.3)}`,
    }
  };
});

const FileStats = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.05)} 100%)`,
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '20px',
  border: `1px solid ${alpha(colors.primary, 0.15)}`,
}));

const ExerciseFileUploadSection = ({ 
  files, 
  displayImages, 
  displayImageDescriptions = [], 
  onUpdateFiles, 
  onUpdateImages, 
  disabled = false
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState(''); // 'resource' or 'image'
  const [uploading, setUploading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewType, setPreviewType] = useState(''); // 'image' or 'file'
  const fileInputRef = useRef(null);
  const axiosInstance = useAxios();
  const { showAlert } = useAlert();
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  
  const handleOpenUploadDialog = (type) => {
    setUploadType(type);
    setUploadDialogOpen(true);
  };
  
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setError('');
  };
  
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };
  
  const analyzeImage = async (assetId) => {
    try {
      setAnalyzingImage(true);
      const response = await axiosInstance.get(`/api/image-analysis/describe/${assetId}`);
      return response.data;
    } catch (err) {
      console.error('Error analyzing image:', err);
      // Don't throw error as this is optional enhancement
      return null;
    } finally {
      setAnalyzingImage(false);
    }
  };
  
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/public/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data; // This is the asset ID
  };
  
  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;
    
    try {
      setUploading(true);
      setError('');
      
      const uploadedAssets = [];
      const imageDescriptions = [];
      
      for (const file of selectedFiles) {
        // Upload the file and get asset ID
        const assetId = await uploadFile(file);
        uploadedAssets.push(assetId);
        
        // If it's an image, analyze it for description
        if (uploadType === 'image') {
          const description = await analyzeImage(assetId);
          imageDescriptions.push(description);
        }
      }
      
      // Update the appropriate state
      if (uploadType === 'resource') {
        onUpdateFiles([...files, ...uploadedAssets]);
        showAlert('Files uploaded successfully', 'success');
      } else if (uploadType === 'image') {
        if (onUpdateImages) {
          onUpdateImages([...displayImages, ...uploadedAssets], [...displayImageDescriptions, ...imageDescriptions]);
        }
        showAlert('Images uploaded and analyzed successfully', 'success');
      }
      
      handleCloseUploadDialog();
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err.response?.data?.message || 'Failed to upload files');
    } finally {
      setUploading(false);
      event.target.value = null; // Reset input
    }
  };
  
  const handleDeleteFile = (index, type) => {
    if (type === 'resource') {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      onUpdateFiles(newFiles);
    } else if (type === 'image') {
      const newImages = [...displayImages];
      newImages.splice(index, 1);
      onUpdateImages(newImages);
      
      // Also remove the corresponding image description
      if (displayImageDescriptions) {
        const newDescriptions = [...displayImageDescriptions];
        newDescriptions.splice(index, 1);
      }
    }
  };
  
  const handleOpenPreview = (item, type) => {
    setPreviewItem(item);
    setPreviewType(type);
    setPreviewOpen(true);
  };
  
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
  };
  
  const getFileIcon = (assetId, type) => {
    // For images, show image icon
    if (type === 'image') {
      return <Image sx={{ color: colors.primary }} />;
    }
    
    // For files, we don't have filename anymore, so show generic file icon
    return <AttachFile sx={{ color: colors.text.secondary }} />;
  };
  
  const getFileDisplayName = (assetId, type) => {
    // Since we only have asset IDs now, create a user-friendly display name
    if (type === 'image') {
      return `Image (${assetId.substring(0, 8)}...)`;
    }
    return `File (${assetId.substring(0, 8)}...)`;
  };
  
  const totalFiles = files.length + displayImages.length;
  const hasAnalyzedImages = displayImageDescriptions.filter(Boolean).length;
  
  return (
    <Box>
      {/* File Statistics */}
      {totalFiles > 0 && (
        <FileStats>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<Folder />}
                label={`${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
                size="small"
                sx={{
                  backgroundColor: alpha(colors.info, 0.1),
                  color: colors.info,
                  border: `1px solid ${alpha(colors.info, 0.2)}`,
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<Image />}
                label={`${displayImages.length} ${displayImages.length === 1 ? 'Image' : 'Images'}`}
                size="small"
                sx={{
                  backgroundColor: alpha(colors.secondary, 0.1),
                  color: colors.secondary,
                  border: `1px solid ${alpha(colors.secondary, 0.2)}`,
                  fontWeight: 600,
                }}
              />
              {hasAnalyzedImages > 0 && (
                <Chip
                  icon={<AutoAwesome />}
                  label={`${hasAnalyzedImages} AI Analyzed`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                    border: `1px solid ${alpha(colors.success, 0.2)}`,
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>
          </Stack>
        </FileStats>
      )}

      {/* Upload Actions */}
      <Stack direction="row" spacing={2} mb={3}>
        <ActionButton
          variant="contained"
          color="info"
          startIcon={<AttachFile />}
          onClick={() => handleOpenUploadDialog('resource')}
          disabled={disabled || uploading}
        >
          Add Resource Files
        </ActionButton>
        
        <ActionButton
          variant="contained"
          color="secondary"
          startIcon={<Image />}
          onClick={() => handleOpenUploadDialog('image')}
          disabled={disabled || uploading}
        >
          Add Display Images
        </ActionButton>
        
        {(uploading || analyzingImage) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
            <CircularProgress size={20} sx={{ color: colors.primary }} />
            <Typography 
              sx={{ 
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '0.875rem',
                color: colors.text.secondary,
                fontWeight: 500
              }}
            >
              {uploading ? 'Uploading files...' : 'Analyzing images...'}
            </Typography>
          </Box>
        )}
      </Stack>
      
      {/* File Display */}
      {totalFiles > 0 ? (
      <Grid container spacing={3}>
            {files.length > 0 && (
              <Grid item xs={12} md={6}>
              <ModernCard elevation={1}>
                <Box p={3}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Folder sx={{ color: colors.info, fontSize: '1.2rem' }} />
                  <Typography 
                      variant="h6" 
                    sx={{ 
                        fontWeight: 700,
                        color: colors.text.primary,
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    Resource Files
                  </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    {files.map((assetId, index) => (
                      <FileCard key={index} fileType="resource">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: alpha(colors.info, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.info
                          }}>
                            <AttachFile />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{ 
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                              }}
                            >
                              {getFileDisplayName(assetId, 'resource')}
                            </Typography>
                            <Typography
                              sx={{ 
                                fontSize: '0.75rem',
                                color: colors.text.secondary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                              }}
                            >
                              Resource file for coachees
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Preview File">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenPreview(assetId, 'file')}
                                sx={{
                                  backgroundColor: alpha(colors.primary, 0.1),
                                  color: colors.primary,
                                  '&:hover': {
                                    backgroundColor: alpha(colors.primary, 0.2),
                                  }
                                }}
                              >
                                <FileOpen fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete File">
                              <IconButton 
                                size="small"
                                onClick={() => handleDeleteFile(index, 'resource')}
                                disabled={disabled}
                                sx={{
                                  backgroundColor: alpha(colors.error, 0.1),
                                  color: colors.error,
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
                        </Stack>
                      </FileCard>
                    ))}
                  </Stack>
                </Box>
              </ModernCard>
              </Grid>
            )}
            
            {displayImages.length > 0 && (
              <Grid item xs={12} md={6}>
              <ModernCard elevation={1}>
                <Box p={3}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Image sx={{ color: colors.secondary, fontSize: '1.2rem' }} />
                  <Typography 
                      variant="h6" 
                    sx={{ 
                        fontWeight: 700,
                        color: colors.text.primary,
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    Display Images
                  </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    {displayImages.map((assetId, index) => (
                      <FileCard key={index} fileType="image">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: alpha(colors.secondary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.secondary
                          }}>
                            <Image />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography
                                sx={{ 
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  color: colors.text.primary,
                                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}
                              >
                                {getFileDisplayName(assetId, 'image')}
                              </Typography>
                              {displayImageDescriptions && displayImageDescriptions[index] && (
                                <Tooltip title="AI analyzed for accessibility">
                                  <AutoAwesome 
                                    sx={{ 
                                      fontSize: '16px', 
                                      color: colors.success
                                    }} 
                                  />
                                </Tooltip>
                              )}
                            </Stack>
                              <Typography
                                sx={{ 
                                  fontSize: '0.75rem',
                                  color: colors.text.secondary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                              }}
                            >
                              {displayImageDescriptions && displayImageDescriptions[index] 
                                ? 'AI analyzed ✓' 
                                : 'Display image for coachees'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Preview Image">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenPreview(assetId, 'image')}
                                sx={{
                                  backgroundColor: alpha(colors.primary, 0.1),
                                  color: colors.primary,
                                  '&:hover': {
                                    backgroundColor: alpha(colors.primary, 0.2),
                                  }
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Image">
                              <IconButton 
                                size="small"
                                onClick={() => handleDeleteFile(index, 'image')}
                                disabled={disabled}
                                sx={{
                                  backgroundColor: alpha(colors.error, 0.1),
                                  color: colors.error,
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
                        </Stack>
                      </FileCard>
                    ))}
                  </Stack>
                </Box>
              </ModernCard>
              </Grid>
            )}
        </Grid>
      ) : (
        <ModernCard elevation={0}>
          <UploadZone
            onClick={() => handleOpenUploadDialog('resource')}
            isUploading={uploading || analyzingImage}
          >
            <CloudUpload sx={{ fontSize: '3rem', color: colors.text.disabled, mb: 2 }} />
            <Typography 
              variant="h6"
              sx={{ 
                fontWeight: 700,
                color: colors.text.secondary,
                mb: 1,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              No Files Added Yet
              </Typography>
            <Typography 
              sx={{ 
                color: colors.text.disabled,
                fontSize: '0.875rem',
                maxWidth: '400px',
                lineHeight: 1.6,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Upload resource files and display images to enhance your exercise. Files help provide context while images make content more engaging.
              </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <ActionButton
                variant="outlined"
                color="info"
                startIcon={<AttachFile />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenUploadDialog('resource');
                }}
                disabled={disabled || uploading}
              >
                Add Files
              </ActionButton>
              <ActionButton
                variant="outlined"
                color="secondary"
                startIcon={<Image />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenUploadDialog('image');
                }}
                disabled={disabled || uploading}
              >
                Add Images
              </ActionButton>
            </Stack>
          </UploadZone>
        </ModernCard>
      )}
      
      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            borderRadius: '12px',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        multiple
        accept={uploadType === 'image' ? 'image/*' : '*'}
        disabled={uploading}
      />
      
      {/* Enhanced Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={handleCloseUploadDialog}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: uploadType === 'resource'
            ? `linear-gradient(135deg, ${colors.info} 0%, ${colors.infoLight} 100%)`
            : `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
          color: colors.text.inverse,
          fontWeight: 700,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '1.25rem',
          p: 3
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              backgroundColor: alpha(colors.text.inverse, 0.2),
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {uploadType === 'resource' ? <AttachFile sx={{ fontSize: '1.5rem' }} /> : <Image sx={{ fontSize: '1.5rem' }} />}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {uploadType === 'resource' ? 'Add Resource Files' : 'Add Display Images'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {uploadType === 'resource' 
                  ? 'Upload files for coachees to reference' 
                  : 'Upload images with automatic AI analysis'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body1" paragraph sx={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: colors.text.primary,
            fontSize: '1rem',
            mb: 3
          }}>
            {uploadType === 'resource' 
              ? 'Upload files that will be available to coachees during the exercise. Supported formats include PDFs, documents, spreadsheets, and more.' 
              : 'Upload images that will be displayed to coachees during the exercise. Images will be automatically analyzed using AI for enhanced accessibility.'}
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                backgroundColor: alpha(colors.error, 0.1),
                border: `1px solid ${alpha(colors.error, 0.2)}`,
                '& .MuiAlert-icon': {
                  color: colors.error
                }
              }}
            >
              <Typography variant="body2" fontWeight="bold" sx={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {error}
              </Typography>
            </Alert>
          )}
          
          <UploadZone
            isDragging={false}
            isUploading={uploading || analyzingImage}
            onClick={!uploading ? handleFileSelect : undefined}
            sx={{ minHeight: '200px' }}
          >
            {uploading || analyzingImage ? (
              <Box position="relative" zIndex={1}>
                <CircularProgress sx={{ color: colors.primary, mb: 2 }} size={40} />
                <Typography variant="h6" color={colors.text.primary} fontWeight={600} sx={{ mb: 1 }}>
                  {uploadType === 'image' && analyzingImage ? 'Analyzing Images...' : 'Uploading Files...'}
                </Typography>
                <Typography variant="body2" color={colors.text.secondary}>
                  {uploadType === 'image' && analyzingImage 
                    ? 'AI is analyzing images for enhanced accessibility'
                    : 'Please wait while your files are processed'}
                </Typography>
                <LinearProgress 
                  sx={{ 
                    mt: 2, 
                    width: '200px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: alpha(colors.primary, 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.primary,
                    }
                  }} 
                />
              </Box>
            ) : (
              <Box position="relative" zIndex={1}>
                <CloudUpload sx={{ fontSize: '3rem', color: colors.primary, mb: 2 }} />
                <Typography variant="h6" color={colors.text.primary} fontWeight={600} sx={{ mb: 1 }}>
                  Click to Select Files
                </Typography>
                <Typography variant="body2" color={colors.text.secondary} sx={{ mb: 2 }}>
                  {uploadType === 'image' 
                    ? 'Select image files - they will be analyzed automatically' 
                    : 'Select multiple files of any supported format'}
                </Typography>
                <Chip
                  label={uploadType === 'image' ? 'Drag & Drop Images' : 'Drag & Drop Files'}
                  size="small"
                  sx={{
                    backgroundColor: alpha(colors.primary, 0.1),
                    color: colors.primary,
                    border: `1px solid ${alpha(colors.primary, 0.2)}`,
                    fontWeight: 600,
                  }}
                />
              </Box>
            )}
          </UploadZone>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <ActionButton 
            onClick={handleCloseUploadDialog} 
            variant="outlined"
            color="secondary"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Cancel'}
          </ActionButton>
        </DialogActions>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview}
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
          {previewType === 'image' ? 'Image Preview' : 'File Preview'}
          <IconButton onClick={handleClosePreview} size="small">
            <Delete fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {previewItem && previewType === 'image' ? (
            <Box 
              component="img"
              src={`${backendBaseUrl}/public/${previewItem}`}
              alt="Image Preview"
              sx={{
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
          ) : previewItem && previewType === 'file' ? (
            <Box sx={{ height: '70vh', width: '100%' }}>
              <iframe 
                src={`${backendBaseUrl}/public/${previewItem}`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title="File Preview"
              />
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>No preview available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClosePreview} 
            variant="contained" 
            color="primary"
            sx={{ 
              textTransform: 'none',
              borderRadius: '8px',
              mb: 1,
              mr: 1
            }}
          >
            Close
          </Button>
          <Button 
            component="a"
            href={previewItem ? `${backendBaseUrl}/public/${previewItem}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined" 
            color="primary"
            sx={{ 
              textTransform: 'none',
              borderRadius: '8px',
              mb: 1,
              mr: 1
            }}
          >
            Open in New Tab
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExerciseFileUploadSection;
