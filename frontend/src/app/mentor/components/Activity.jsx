import React, {useEffect, useState, useRef} from "react";
import {H3, H6, Small} from "../../components/Typography.jsx";
import Grid from "@mui/material/Grid2";
import {
    Box, 
    IconButton, 
    OutlinedInput, 
    styled, 
    Typography,
    Stack,
    Tooltip,
    Button,
    alpha,
    Divider,
    Chip,
    Alert,
    CircularProgress,
    LinearProgress,
    Dialog,
    DialogTitle
} from "@mui/material";
import TextField from "@mui/material/TextField";
import {
    Save, 
    TipsAndUpdates, 
    Assignment,
    Description,
    Title,
    Info,
    Add,
    FitnessCenter,
    ArrowForward,
    AttachFile,
    InsertDriveFile,
    PictureAsPdf,
    Delete,
    Visibility,
    FileOpen,
    CloudUpload,
    Folder,
    GetApp
} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import {useNavigate} from "react-router-dom";
import { colors } from "./ExerciseStyledComponents";


const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': {
        color: colors.text.secondary,
        fontWeight: 500,
        fontSize: '0.875rem',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: colors.primary,
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        '& fieldset': {
            borderColor: colors.border,
            borderWidth: '1.5px',
        },
        '&:hover fieldset': {
            borderColor: colors.borderHover,
        },
        '&.Mui-focused fieldset': {
            borderColor: colors.primary,
            borderWidth: '2px',
        },
        '&.Mui-error fieldset': {
            borderColor: colors.error,
        }
    },
    '& .MuiInputBase-input': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
    },
    '& .MuiFormHelperText-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.75rem',
        marginLeft: '4px',
    }
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
}));

const EnhanceButton = styled(LoadingButton)(({ theme }) => ({
    position: 'absolute',
    right: '12px',
    top: '12px',
    minWidth: 'auto',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: alpha(colors.warning, 0.1),
    color: colors.warning,
    border: `1px solid ${alpha(colors.warning, 0.2)}`,
    '&:hover': {
        backgroundColor: alpha(colors.warning, 0.15),
        transform: 'scale(1.05)',
    },
    '& .MuiLoadingButton-loadingIndicator': {
        color: colors.warning,
    }
}));

const SectionContainer = styled(Box)(({ theme }) => ({
    marginBottom: '32px',
}));

const FileCard = styled(Box)(({ theme, fileType }) => {
    const fileColor = colors.info;
    
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

const FileStats = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.05)} 100%)`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    border: `1px solid ${alpha(colors.primary, 0.15)}`,
}));

const ExpandableTextArea = ({ 
    label, 
    icon, 
    value, 
    onChange, 
    onEnhance, 
    enhancing, 
    placeholder,
    enhanceTooltip,
    id 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <SectionContainer>
            <FieldLabel>
                {icon}
                {label}
                <Tooltip title={enhanceTooltip}>
                    <Info sx={{ fontSize: '14px', color: colors.text.disabled, cursor: 'help' }} />
                </Tooltip>
            </FieldLabel>
            <Box sx={{ position: 'relative' }}>
                <StyledTextField
                    fullWidth
                    id={id}
                    multiline
                    rows={isExpanded ? 12 : 6}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    sx={{
                        '& .MuiInputBase-root': {
                            alignItems: 'flex-start',
                        }
                    }}
                />
                <EnhanceButton
                    loading={enhancing}
                    onClick={onEnhance}
                    title={enhanceTooltip}
                >
                    <TipsAndUpdates sx={{ fontSize: '18px' }} />
                </EnhanceButton>
            </Box>
            <Button
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{
                    marginTop: '8px',
                    color: colors.text.secondary,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
            >
                {isExpanded ? 'Show Less' : 'Expand Editor'}
            </Button>
        </SectionContainer>
    );
};

const Activity = ({milestone}) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [enhancingOutline, setEnhancingOutline] = useState(false);
    const [creatingExercise, setCreatingExercise] = useState(false);
    const [name, setName] = useState(milestone.activity.name);
    const [description, setDescription] = useState(milestone.activity.description);
    const [files, setFiles] = useState(milestone.activity.files || []);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    const fileInputRef = useRef(null);
    const hasExercise = milestone.activity.exerciseId !== null && milestone.activity.exerciseId !== undefined;
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const requestBody = {
                name: name,
                description: description,
                files: files
            };

            const { data } = await axiosInstance.put(`/api/programs/activities/${milestone.activity.id}`, requestBody);
            showAlert('Activity updated successfully', 'success');
            setLoading(false);
        } catch (error) {
            console.error('Error updating activity:', error);
            showAlert('Error updating activity', 'error');
            setLoading(false);
        }
    };

    const handleAutoAwesomeOutline = async () => {
        try {
            setEnhancingOutline(true);
            const { data } = await axiosInstance.post('/api/ai/completion', {
                keyword: 'activity_outline',
                id: milestone.id,
                currentText: description
            });
            setDescription(data);
            showAlert('Activity outline enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing activity outline:', error);
            showAlert('Error enhancing activity outline', 'error');
        } finally {
            setEnhancingOutline(false);
        }
    };

    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    const validateFile = (file) => {
        // Check file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return {
                valid: false,
                message: `File ${file.name} exceeds the 10MB size limit`
            };
        }

        // Define allowed file types for coach/trainer resources
        const allowedTypes = [
            'application/pdf', // PDF
            'application/msword', // DOC
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
            'application/vnd.ms-excel', // XLS
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
            'application/vnd.ms-powerpoint', // PPT
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
            'text/plain', // TXT
            'application/rtf', // RTF
            'application/zip', // ZIP
            'image/jpeg', // JPG/JPEG
            'image/png', // PNG
            'image/gif', // GIF
            'application/json', // JSON
            'text/csv', // CSV
            'text/html', // HTML
            'application/epub+zip', // EPUB
            'video/mp4' // MP4 videos
        ];

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message: `File type ${file.type} is not supported`
            };
        }

        return { valid: true };
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
            
            const newFiles = [];
            const invalidFiles = [];
            
            for (const file of selectedFiles) {
                // Validate file
                const validation = validateFile(file);
                if (!validation.valid) {
                    invalidFiles.push(validation.message);
                    continue;
                }
                
                // Upload the file and get asset ID
                const assetId = await uploadFile(file);
                
                // Add file to the list
                newFiles.push({
                    fileName: file.name,
                    contentType: file.type,
                    entityId: assetId
                });
            }
            
            if (invalidFiles.length > 0) {
                setError(`Some files were not uploaded: ${invalidFiles.join(', ')}`);
            }
            
            if (newFiles.length > 0) {
                setFiles([...files, ...newFiles]);
                showAlert(`${newFiles.length} file(s) uploaded successfully`, 'success');
            }
        } catch (err) {
            console.error('Error uploading files:', err);
            setError(err.response?.data?.message || 'Failed to upload files');
        } finally {
            setUploading(false);
            event.target.value = null; // Reset input
        }
    };
    
    const handleDeleteFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };
    
    const handleOpenPreview = (assetId) => {
        setPreviewItem(assetId);
        setPreviewOpen(true);
    };
    
    const handleClosePreview = () => {
        setPreviewOpen(false);
        setPreviewItem(null);
    };
    
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            const dataTransfer = new DataTransfer();
            droppedFiles.forEach(file => dataTransfer.items.add(file));
            
            const event = {
                target: {
                    files: dataTransfer.files,
                    value: null
                }
            };
            
            handleFileChange(event);
        }
    };
    
    const handleCreateExercise = async () => {
        try {
            setCreatingExercise(true);
            const { data } = await axiosInstance.post(`/api/exercise/${milestone.activity.id}`);
            
            showAlert('Exercise created successfully', 'success');
            // Navigate to the exercise wizard
            navigate(`/portal/exercise/${data.id}`);
        } catch (error) {
            console.error('Error creating exercise:', error);
            showAlert('Error creating exercise', 'error');
        } finally {
            setCreatingExercise(false);
        }
    };
    
    const handleNavigateToExercise = () => {
        navigate(`/portal/exercise/${milestone.activity.exerciseId}`);
    };

    return (
        <Box sx={{ 
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '32px',
                paddingBottom: '16px',
                borderBottom: `1px solid ${colors.border}`
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Box sx={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        backgroundColor: alpha(colors.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Assignment sx={{ color: colors.primary, fontSize: '24px' }} />
                    </Box>
                    <Box>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.25rem',
                                marginBottom: '4px'
                            }}
                        >
                            Activity Configuration
                        </Typography>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                fontSize: '0.875rem'
                            }}
                        >
                            Define activity details, outline, and trainer guidance
                        </Typography>
                    </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: '12px' }}>
                    {!hasExercise && (
                        <Tooltip title="Create Exercise for this Activity">
                            <LoadingButton
                                loading={creatingExercise}
                                startIcon={<Add />}
                                variant="outlined"
                                onClick={handleCreateExercise}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    padding: '10px 20px',
                                    borderColor: colors.primary,
                                    color: colors.primary,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.primary, 0.05),
                                        borderColor: colors.primary,
                                        transform: 'translateY(-1px)',
                                    }
                                }}
                            >
                                Create Exercise
                            </LoadingButton>
                        </Tooltip>
                    )}
                    
                    {hasExercise && (
                        <Tooltip title="Go to Exercise Wizard">
                            <Button
                                startIcon={<ArrowForward />}
                                variant="outlined"
                                onClick={handleNavigateToExercise}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    padding: '10px 20px',
                                    borderColor: colors.primary,
                                    color: colors.primary,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.primary, 0.05),
                                        borderColor: colors.primary,
                                        transform: 'translateY(-1px)',
                                    }
                                }}
                            >
                                Go to Exercise
                            </Button>
                        </Tooltip>
                    )}
                    
                    <Tooltip title="Save Activity Changes">
                        <LoadingButton
                            loading={loading}
                            startIcon={<Save />}
                            variant="contained"
                            onClick={handleSubmit}
                            sx={{
                                backgroundColor: colors.success,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                padding: '10px 20px',
                                '&:hover': {
                                    backgroundColor: '#059669',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                }
                            }}
                        >
                            Save Changes
                        </LoadingButton>
                    </Tooltip>
                </Box>
            </Box>

            <Stack spacing={4}>
                {/* Activity Name Field and Exercise Status */}
                <SectionContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <FieldLabel>
                            <Title sx={{ fontSize: '14px' }} />
                            Activity Name *
                        </FieldLabel>
                        
                        {/* Exercise Status Indicator */}
                        {hasExercise ? (
                            <Chip
                                icon={<FitnessCenter sx={{ fontSize: '16px' }} />}
                                label="Has Exercise"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ 
                                    borderRadius: '8px',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                }}
                            />
                        ) : (
                            <Chip
                                icon={<Info sx={{ fontSize: '16px' }} />}
                                label="No Exercise"
                                size="small"
                                color="default"
                                variant="outlined"
                                sx={{ 
                                    borderRadius: '8px',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                }}
                            />
                        )}
                    </Box>
                    
                    <StyledTextField
                        fullWidth
                        id="name"
                        placeholder="Enter a descriptive name for this activity"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    

                </SectionContainer>

                <Divider sx={{ marginY: '16px' }} />

                {/* Activity Outline */}
                <ExpandableTextArea
                    label="Activity Outline"
                    icon={<Description sx={{ fontSize: '14px' }} />}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    onEnhance={handleAutoAwesomeOutline}
                    enhancing={enhancingOutline}
                    placeholder="Describe the activity structure, objectives, steps, and expected outcomes..."
                    enhanceTooltip="Use AI to enhance the activity outline"
                    id="description"
                />

                <Divider sx={{ marginY: '16px' }} />

                {/* File Upload Section */}
                <SectionContainer>
                    <FieldLabel>
                        <AttachFile sx={{ fontSize: '14px' }} />
                        Resource Files
                        <Tooltip title="Upload files for trainers and coachees">
                            <Info sx={{ fontSize: '14px', color: colors.text.disabled, cursor: 'help' }} />
                        </Tooltip>
                    </FieldLabel>
                    
                    <Box
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {/* File Statistics */}
                        {files.length > 0 && (
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
                                    </Stack>
                                </Stack>
                            </FileStats>
                        )}
                        
                        {/* File Display */}
                        {files.length > 0 ? (
                            <Box>
                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    {files.map((file, index) => (
                                        <FileCard key={index}>
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
                                                    {file.contentType && file.contentType.includes('pdf') ? (
                                                        <PictureAsPdf />
                                                    ) : (
                                                        <InsertDriveFile />
                                                    )}
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
                                                        {file.fileName || `File (${file.entityId.substring(0, 8)}...)`}
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
                                                            onClick={() => handleOpenPreview(file.entityId)}
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
                                                            onClick={() => handleDeleteFile(index)}
                                                            sx={{
                                                                backgroundColor: alpha(colors.error, 0.1),
                                                                color: colors.error,
                                                                '&:hover': {
                                                                    backgroundColor: alpha(colors.error, 0.2),
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
                                
                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={handleFileSelect}
                                    disabled={uploading}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        padding: '10px 20px',
                                        borderColor: colors.primary,
                                        color: colors.primary,
                                        '&:hover': {
                                            backgroundColor: alpha(colors.primary, 0.05),
                                            borderColor: colors.primary,
                                            transform: 'translateY(-1px)',
                                        }
                                    }}
                                >
                                    Add More Files
                                </Button>
                            </Box>
                        ) : (
                            <UploadZone
                                onClick={handleFileSelect}
                                isDragging={isDragging}
                                isUploading={uploading}
                            >
                                {uploading ? (
                                    <Box position="relative" zIndex={1}>
                                        <CircularProgress sx={{ color: colors.primary, mb: 2 }} size={40} />
                                        <Typography variant="h6" color={colors.text.primary} fontWeight={600} sx={{ mb: 1 }}>
                                            Uploading Files...
                                        </Typography>
                                        <Typography variant="body2" color={colors.text.secondary}>
                                            Please wait while your files are processed
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
                                            Click to Upload Files
                                        </Typography>
                                        <Typography variant="body2" color={colors.text.secondary} sx={{ mb: 2 }}>
                                            Upload resource files for trainers and coachees (Max 10MB per file)
                                        </Typography>
                                        <Chip
                                            label="Drag & Drop Files"
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
                            disabled={uploading}
                        />
                    </Box>
                </SectionContainer>
            </Stack>
            
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
                    File Preview
                    <IconButton onClick={handleClosePreview} size="small">
                        <Delete fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <Box sx={{ height: '70vh', width: '100%' }}>
                    {previewItem && (
                        <iframe 
                            src={`${backendBaseUrl}/public/${previewItem}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            title="File Preview"
                        />
                    )}
                </Box>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                        onClick={handleClosePreview} 
                        variant="outlined" 
                        color="primary"
                        sx={{ 
                            textTransform: 'none',
                            borderRadius: '8px'
                        }}
                    >
                        Close
                    </Button>
                    <Button 
                        component="a"
                        href={previewItem ? `${backendBaseUrl}/public/${previewItem}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained" 
                        color="primary"
                        sx={{ 
                            textTransform: 'none',
                            borderRadius: '8px'
                        }}
                    >
                        Open in New Tab
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
};

export default Activity;