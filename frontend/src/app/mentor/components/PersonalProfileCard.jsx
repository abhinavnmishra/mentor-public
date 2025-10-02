import {
    Card, 
    Divider, 
    IconButton, 
    styled, 
    Alert, 
    CircularProgress, 
    Menu, 
    MenuItem,
    Typography,
    Box,
    Stack,
    alpha,
    Tooltip,
    Dialog,
    DialogContent,
    Slide,
    Paper,
    Portal,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import {H3, H5} from '../../components/Typography.jsx';
import * as React from "react";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import {
    AddReaction, 
    AutoAwesome, 
    Save, 
    Edit, 
    Delete, 
    Visibility,
    Person,
    Email,
    Description,
    Badge,
    LocationOn,
    LinkedIn,
    AccessTime,
    Warning
} from "@mui/icons-material";
import { Editor } from '@tinymce/tinymce-react';
import {useRef, useState, useEffect, useMemo} from "react";
import useAuth from "../../hooks/useAuth.js";
import { useAxios } from '../../contexts/AxiosContext';
import LoadingButton from '@mui/lab/LoadingButton';
import html2canvas from 'html2canvas';

// Modern color palette consistent with other components
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

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const ModernCard = styled(Card)(({ theme }) => ({
    padding: '32px',
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginBottom: '32px',
    [theme.breakpoints.down("md")]: { 
        padding: "24px",
        marginBottom: '24px'
    },
    [theme.breakpoints.down("sm")]: { 
        padding: "20px",
        marginBottom: '20px'
    }
}));

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

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${colors.border}`,
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

const IconContainer = styled(Box)(({ theme }) => ({
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    height: '40px'
}));

const EnhanceButton = styled(LoadingButton)(({ theme }) => ({
    borderRadius: '12px',
    minWidth: 'auto',
    width: '48px',
    height: '48px',
    backgroundColor: alpha(colors.warning, 0.1),
    color: colors.warning,
    border: `1px solid ${alpha(colors.warning, 0.2)}`,
    transition: 'all 0.2s ease-in-out',
    position: 'absolute',
    right: '16px',
    top: '16px',
    '&:hover': {
        backgroundColor: alpha(colors.warning, 0.15),
        transform: 'scale(1.05)',
    },
    '& .MuiLoadingButton-loadingIndicator': {
        color: colors.warning,
    }
}));

const SaveButton = styled(LoadingButton)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 24px',
    backgroundColor: colors.success,
    minWidth: '120px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: '#059669',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    flexDirection: 'column',
    gap: '16px'
}));

const ProfileImageContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '24px'
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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
    '& .MuiSelect-select': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
    }
}));

const FloatingNotification = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '16px 20px',
    borderRadius: '16px',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '320px',
    maxWidth: '400px',
    zIndex: 1300,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    [theme.breakpoints.down('sm')]: {
        bottom: '16px',
        right: '16px',
        left: '16px',
        minWidth: 'auto',
        maxWidth: 'none',
    }
}));

const FloatingSaveButton = styled(LoadingButton)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '8px 16px',
    backgroundColor: colors.success,
    minWidth: '80px',
    '&:hover': {
        backgroundColor: '#059669',
    }
}));

// Common timezone options for selection
const timezoneOptions = [
    { id: 'UTC', label: 'UTC - Coordinated Universal Time' },
    { id: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { id: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { id: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { id: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { id: 'America/Anchorage', label: 'Alaska Time' },
    { id: 'Pacific/Honolulu', label: 'Hawaii Time' },
    { id: 'Europe/London', label: 'GMT - Greenwich Mean Time' },
    { id: 'Europe/Berlin', label: 'Central European Time' },
    { id: 'Europe/Paris', label: 'Central European Time (Paris)' },
    { id: 'Europe/Rome', label: 'Central European Time (Rome)' },
    { id: 'Europe/Madrid', label: 'Central European Time (Madrid)' },
    { id: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)' },
    { id: 'Europe/Moscow', label: 'Moscow Time' },
    { id: 'Asia/Dubai', label: 'Gulf Standard Time' },
    { id: 'Asia/Kolkata', label: 'India Standard Time' },
    { id: 'Asia/Shanghai', label: 'China Standard Time' },
    { id: 'Asia/Tokyo', label: 'Japan Standard Time' },
    { id: 'Asia/Seoul', label: 'Korea Standard Time' },
    { id: 'Australia/Sydney', label: 'Australian Eastern Time' },
    { id: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)' },
    { id: 'Australia/Perth', label: 'Australian Western Time' },
    { id: 'Pacific/Auckland', label: 'New Zealand Time' }
];

const PersonalProfileCard = () => {
    const [signature, setSignature] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [overview, setOverview] = useState('');
    const [id, setId] = useState('');
    const [qualifications, setQualifications] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [enhancingOverview, setEnhancingOverview] = useState(false);
    const [enhancingQualifications, setEnhancingQualifications] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [signatureImageError, setSignatureImageError] = useState('');
    const [processingSignatureImage, setProcessingSignatureImage] = useState(false);
    const [signatureImageId, setSignatureImageId] = useState('');
    const [location, setLocation] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [timeZone, setTimeZone] = useState('UTC');
    const [generatingSignature, setGeneratingSignature] = useState(false);
    
    // State for tracking unsaved changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [originalData, setOriginalData] = useState({});
    
    const signatureRef = useRef(null);
    const fileInputRef = useRef(null);
    const { user } = useAuth();
    const trainerId = user.id;
    const axios = useAxios();
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

    useEffect(() => {
        fetchTrainerProfile();
    }, [trainerId]);

    // Memoize current data to prevent unnecessary re-renders
    const currentData = useMemo(() => ({
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        overview: overview || '',
        qualifications: qualifications || '',
        signature: signature || '',
        profileImageUrl: profileImageUrl || '',
        location: location || '',
        linkedinUrl: linkedinUrl || '',
        timeZone: timeZone || 'UTC'
    }), [firstName, lastName, email, overview, qualifications, signature, profileImageUrl, location, linkedinUrl, timeZone]);

    // Effect to detect unsaved changes
    useEffect(() => {
        // Only check for changes if we have original data (after initial load)
        if (Object.keys(originalData).length === 0) {
            setHasUnsavedChanges(false);
            return;
        }

        // Deep comparison of current data with original data
        const hasChanges = Object.keys(currentData).some(key => {
            const current = currentData[key];
            const original = originalData[key] || '';
            return current !== original;
        });

        setHasUnsavedChanges(hasChanges);
    }, [currentData, originalData]);

    const fetchTrainerProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`/api/trainers/profile/${trainerId}`);
            const data = response.data;

            setId(data.id || '');
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setEmail(data.email || '');
            setOverview(data.shortDescription || '');
            setQualifications(data.longDescription || '');
            setSignature(data.signature || '');
            setProfileImageUrl(data.profileImageUrl || '');
            setSignatureImageId(data.signatureImageId || '');
            setLocation(data.location || '');
            setLinkedinUrl(data.linkedinUrl || '');
            setTimeZone(data.timeZone || 'UTC');
            
            // Store original data for comparison
            setOriginalData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                overview: data.shortDescription || '',
                qualifications: data.longDescription || '',
                signature: data.signature || '',
                profileImageUrl: data.profileImageUrl || '',
                location: data.location || '',
                linkedinUrl: data.linkedinUrl || '',
                timeZone: data.timeZone || 'UTC'
            });
        } catch (err) {
            setError('Failed to load profile data');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignatureChange = (content, editor) => {
        setSignature(content);
    };

    // Function to detect and process external images in editor content
    const processExternalImages = async (editor) => {
        const content = editor.getContent();
        
        // Parse the HTML content using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Find all image tags
        const images = doc.querySelectorAll('img');
        let contentModified = false;
        let errors = [];
        
        // Process each image
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const imgSrc = img.getAttribute('src');
            
            // Only process external images (not our own hosted images)
            if (imgSrc && !imgSrc.includes(`${backendBaseUrl}/public/`) && 
                (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'))) {
                
                try {
                    // Show loading indicator
                    editor.setProgressState(true);
                    
                    // Download the external image
                    const response = await axios.post('/public/download-external', null, {
                        params: { url: imgSrc }
                    });
                    
                    // Get the new image ID
                    const imageId = response.data;
                    
                    // Replace the external URL with our hosted URL
                    img.setAttribute('src', `${backendBaseUrl}/public/${imageId}`);
                    img.setAttribute('data-original-src', imgSrc); // Store original for reference
                    
                    contentModified = true;
                } catch (error) {
                    console.error('Failed to download external image:', error);
                    errors.push(`Failed to download image from source. Please remove this image as it might not be rendered in the way you expect. Source: ${imgSrc}: ${error.message || 'Unknown error'}`);
                    // We don't modify this image if download fails
                }
            }
        }
        
        // Set error state if any issues occurred
        if (errors.length > 0) {
            const errorMessage = errors.join('; ');
            setSignatureImageError(errorMessage);
        } else {
            // Clear errors if no issues occurred
            setSignatureImageError('');
        }
        
        // If content was modified, update the editor content
        if (contentModified) {
            // Convert the modified document back to HTML string
            const newContent = doc.body.innerHTML;
            
            // Pause the onChange handler temporarily to avoid circular updates
            const originalOnChange = editor.settings.onChange;
            editor.settings.onChange = null;
            
            // Update the editor content
            editor.setContent(newContent);
            
            // Restore the onChange handler
            setTimeout(() => {
                editor.settings.onChange = originalOnChange;
            }, 0);
            
            // Update the state variable
            setSignature(newContent);
        }
        
        // Hide loading indicator
        editor.setProgressState(false);
    };

    const convertAndUploadHtml = async (editor, type) => {
        try {
            const setProcessing = setProcessingSignatureImage;
            setProcessing(true);
            
            // Get the content from the editor
            const content = editor.getContent();
            
            // Create a temporary div to render the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            tempDiv.style.width = '850px'; // Match the editor width from content_style
            tempDiv.style.padding = '20px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            
            // Add styles to preserve image aspect ratio
            const style = document.createElement('style');
            style.textContent = `
                img { 
                    max-width: 100% !important; 
                    height: auto !important; 
                    object-fit: contain !important;
                }
            `;
            tempDiv.appendChild(style);
            
            document.body.appendChild(tempDiv);
            
            // Find all images and ensure they're fully loaded before conversion
            const images = tempDiv.querySelectorAll('img');
            if (images.length > 0) {
                await Promise.all(Array.from(images).map(img => {
                    return new Promise((resolve) => {
                        if (img.complete) {
                            resolve();
                        } else {
                            img.onload = resolve;
                            img.onerror = resolve; // Continue even if image fails to load
                        }
                    });
                }));
            }
            
            // Allow a brief render time
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Use html2canvas to convert to image
            const canvas = await html2canvas(tempDiv, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: 'white',
                scale: 2, // Higher resolution
                imageTimeout: 15000, // Longer timeout for image loading
                logging: false,
                onclone: (clonedDoc) => {
                    // Additional opportunity to modify the cloned document before rendering
                    const clonedImages = clonedDoc.querySelectorAll('img');
                    clonedImages.forEach(img => {
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.style.objectFit = 'contain';
                    });
                }
            });
            
            // Convert canvas to blob and upload
            return new Promise((resolve, reject) => {
                canvas.toBlob(async (blob) => {
                    try {
                        // Create a file from the blob
                        const file = new File([blob], `${type}_template.png`, { type: 'image/png' });
                        
                        // Create form data for upload
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        // Create entity ID with concatenation of trainerId and type suffix
                        const entityId = `${trainerId}-${type}`;
                        
                        // Upload the image with entityId parameter
                        const response = await axios.post('/public/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                            params: { entityId }
                        });
                        
                        // Get the image ID from the response
                        const imageId = response.data;
                        
                        // Clean up temp div
                        document.body.removeChild(tempDiv);
                        setProcessing(false);
                        
                        // Return the image ID
                        resolve(imageId);
                    } catch (err) {
                        document.body.removeChild(tempDiv);
                        setProcessing(false);
                        reject(err);
                    }
                }, 'image/png');
            });
        } catch (err) {
            console.error(`Error processing ${type} image:`, err);
            setProcessingSignatureImage(false);
            throw err;
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccessMessage('');
            
            // Variable to store the signature image ID
            let signatureImgId = signatureImageId;

            // First convert and upload the HTML signature content as image
            if (signatureRef.current) {
                signatureImgId = await convertAndUploadHtml(signatureRef.current, 'signature');
                setSignatureImageId(signatureImgId);
            }

            const updateData = {
                firstName,
                lastName,
                email,
                shortDescription: overview,
                longDescription: qualifications,
                signature: signature,
                profileImageUrl: profileImageUrl,
                signatureImageId: signatureImgId,
                location,
                linkedinUrl,
                timeZone
            };

            const response = await axios.put(`/api/trainers/profile/${trainerId}`, updateData);
            const updatedData = response.data;

            // Update form with returned data
            setFirstName(updatedData.firstName || '');
            setLastName(updatedData.lastName || '');
            setEmail(updatedData.email || '');
            setOverview(updatedData.shortDescription || '');
            setQualifications(updatedData.longDescription || '');
            setSignature(updatedData.signature || '');
            setProfileImageUrl(updatedData.profileImageUrl || '');
            setLocation(updatedData.location || '');
            setLinkedinUrl(updatedData.linkedinUrl || '');
            setTimeZone(updatedData.timeZone || 'UTC');
            // Update the signature image ID if it's returned
            if (updatedData.signatureImageId) setSignatureImageId(updatedData.signatureImageId);

            // Update original data to reflect saved state
            setOriginalData({
                firstName: updatedData.firstName || '',
                lastName: updatedData.lastName || '',
                email: updatedData.email || '',
                overview: updatedData.shortDescription || '',
                qualifications: updatedData.longDescription || '',
                signature: updatedData.signature || '',
                profileImageUrl: updatedData.profileImageUrl || '',
                location: updatedData.location || '',
                linkedinUrl: updatedData.linkedinUrl || '',
                timeZone: updatedData.timeZone || 'UTC'
            });

            setSuccessMessage('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            console.error('Error updating profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleAutoAwesomeOverview = async () => {
        if (!trainerId) {
            setError('Trainer ID is required');
            return;
        }

        setEnhancingOverview(true);
        try {
            const response = await axios.post('/api/ai/completion', {
                keyword: 'trainer_short_overview',
                id: id,
                currentText: overview
            });

            setOverview(response.data);
            setSuccessMessage('Overview enhanced successfully');
        } catch (err) {
            setError('Failed to enhance overview');
            console.error('Error enhancing overview:', err);
        } finally {
            setEnhancingOverview(false);
        }
    };

    const handleAutoAwesomeQualifications = async () => {
        if (!trainerId) {
            setError('Trainer ID is required');
            return;
        }

        setEnhancingQualifications(true);
        try {
            const response = await axios.post('/api/ai/completion', {
                keyword: 'trainer_complete_qualification',
                id: id,
                currentText: qualifications
            });

            setQualifications(response.data);
            setSuccessMessage('Qualifications enhanced successfully');
        } catch (err) {
            setError('Failed to enhance qualifications');
            console.error('Error enhancing qualifications:', err);
        } finally {
            setEnhancingQualifications(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            setError('');
            
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/public/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageId = response.data;
            setProfileImageUrl(`/public/${imageId}`);
            setSuccessMessage('Profile image uploaded successfully');
        } catch (err) {
            setError('Failed to upload profile image');
            console.error('Error uploading image:', err);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleImageMenuClose = () => {
        setAnchorEl(null);
    };

    const handleRemoveImage = () => {
        setProfileImageUrl('');
        handleImageMenuClose();
    };

    const handlePreviewImage = () => {
        setPreviewOpen(true);
        handleImageMenuClose();
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
    };

    const handleEditImage = () => {
        fileInputRef.current.click();
        handleImageMenuClose();
    };

    const handleGenerateSignature = async () => {
        try {
            setGeneratingSignature(true);
            setError('');
            const response = await axios.get(`/api/trainers/signature/generate/${trainerId}`);
            if (signatureRef.current) {
                signatureRef.current.setContent(response.data);
                setSignature(response.data);
            }
            setSuccessMessage('Signature generated successfully');
        } catch (err) {
            setError('Failed to generate signature');
            console.error('Error generating signature:', err);
        } finally {
            setGeneratingSignature(false);
        }
    };

    if (loading) {
        return (
            <ModernCard>
                <LoadingContainer>
                    <CircularProgress size={40} sx={{ color: colors.primary }} />
                    <Typography 
                        sx={{ 
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            color: colors.text.secondary,
                            fontSize: '0.875rem'
                        }}
                    >
                        Loading profile...
                    </Typography>
                </LoadingContainer>
            </ModernCard>
        );
    }

    return (
        <ModernCard>
            <Grid container spacing={4}>
                {/* Header Section */}
                <Grid size={{ xs: 12 }}>
                    <SectionHeader>
                        <IconContainer sx={{ 
                            backgroundColor: alpha(colors.primary, 0.1),
                            border: `1px solid ${alpha(colors.primary, 0.2)}`
                        }}>
                            <Person sx={{ color: colors.primary, fontSize: '20px' }} />
                        </IconContainer>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.25rem'
                            }}
                        >
                            Personal Information
                        </Typography>
                    </SectionHeader>
                </Grid>

                {/* Profile Image Section */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <ProfileImageContainer>
                        <Box sx={{ position: 'relative' }}>
                            {!profileImageUrl ? (
                                <Avatar
                                    component="label"
                                    sx={{
                                        color: colors.surface,
                                        backgroundColor: colors.secondary,
                                        height: '150px',
                                        width: '150px',
                                        cursor: 'pointer',
                                        border: `3px solid ${colors.border}`,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: colors.text.secondary,
                                            transform: 'scale(1.05)',
                                        }
                                    }}
                                >
                                    <AddReaction sx={{fontSize: '50px'}}/>
                                    <VisuallyHiddenInput
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                    />
                                </Avatar>
                            ) : (
                                <Box
                                    component="img"
                                    src={`${backendBaseUrl}${profileImageUrl}`}
                                    onClick={handleImageMenuOpen}
                                    sx={{
                                        height: '150px',
                                        width: '150px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        objectFit: 'cover',
                                        border: `3px solid ${colors.border}`,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            borderColor: colors.primary,
                                        }
                                    }}
                                />
                            )}
                            {profileImageUrl && (
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        backgroundColor: colors.surface,
                                        border: `2px solid ${colors.border}`,
                                        width: '36px',
                                        height: '36px',
                                        '&:hover': { 
                                            backgroundColor: colors.background,
                                            borderColor: colors.primary,
                                        }
                                    }}
                                    onClick={handleImageMenuOpen}
                                >
                                    <Edit sx={{ fontSize: '16px', color: colors.text.secondary }} />
                                </IconButton>
                            )}
                        </Box>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                fontSize: '0.875rem',
                                marginTop: '16px',
                                textAlign: 'center'
                            }}
                        >
                            {uploadingImage ? 'Uploading...' : profileImageUrl ? 'Click to manage photo' : 'Click to upload photo'}
                        </Typography>
                    </ProfileImageContainer>
                </Grid>

                {/* Basic Information Section */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Stack spacing={3}>
                        <Box>
                            <FieldLabel>
                                <Person sx={{ fontSize: '14px' }} />
                                First Name
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter your first name"
                            />
                        </Box>

                        <Box>
                            <FieldLabel>
                                <Person sx={{ fontSize: '14px' }} />
                                Last Name
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter your last name"
                            />
                        </Box>

                        <Box>
                            <FieldLabel>
                                <Email sx={{ fontSize: '14px' }} />
                                Email Address
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                            />
                        </Box>

                        <Box>
                            <FieldLabel>
                                <LocationOn sx={{ fontSize: '14px' }} />
                                Location
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter your location"
                            />
                        </Box>

                        <Box>
                            <FieldLabel>
                                <LinkedIn sx={{ fontSize: '14px' }} />
                                LinkedIn URL
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="Enter your LinkedIn profile URL"
                            />
                        </Box>

                        <Box>
                            <FieldLabel>
                                <AccessTime sx={{ fontSize: '14px' }} />
                                Time Zone
                            </FieldLabel>
                            <StyledFormControl fullWidth>
                                <Select
                                    value={timeZone}
                                    onChange={(e) => setTimeZone(e.target.value)}
                                    displayEmpty
                                >
                                    {timezoneOptions.map((option) => (
                                        <MenuItem 
                                            key={option.id} 
                                            value={option.id}
                                            sx={{
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </StyledFormControl>
                        </Box>
                    </Stack>
                </Grid>

                {/* About Section */}
                <Grid size={{ xs: 12 }}>
                    <SectionHeader>
                        <IconContainer sx={{ 
                            backgroundColor: alpha(colors.secondary, 0.1),
                            border: `1px solid ${alpha(colors.secondary, 0.2)}`
                        }}>
                            <Description sx={{ color: colors.secondary, fontSize: '20px' }} />
                        </IconContainer>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.25rem'
                            }}
                        >
                            About
                        </Typography>
                    </SectionHeader>

                    <Stack spacing={3}>
                        <Box sx={{ position: 'relative' }}>
                            <FieldLabel>
                                <Description sx={{ fontSize: '14px' }} />
                                Short Overview
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                multiline
                                value={overview}
                                onChange={(e) => setOverview(e.target.value)}
                                placeholder="Brief overview of your background and expertise..."
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '120px',
                                        alignItems: 'flex-start',
                                        paddingRight: '64px',
                                    },
                                    '& .MuiInputBase-input': {
                                        resize: 'vertical',
                                    }
                                }}
                            />
                            <Tooltip title="Enhance with AI">
                                <EnhanceButton
                                    loading={enhancingOverview}
                                    onClick={handleAutoAwesomeOverview}
                                >
                                    <AutoAwesome sx={{ fontSize: '20px' }} />
                                </EnhanceButton>
                            </Tooltip>
                        </Box>

                        <Box sx={{ position: 'relative' }}>
                            <FieldLabel>
                                <Badge sx={{ fontSize: '14px' }} />
                                Complete Qualifications
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                multiline
                                value={qualifications}
                                onChange={(e) => setQualifications(e.target.value)}
                                placeholder="Detailed information about your qualifications, certifications, and experience..."
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '200px',
                                        alignItems: 'flex-start',
                                        paddingRight: '64px',
                                    },
                                    '& .MuiInputBase-input': {
                                        resize: 'vertical',
                                    }
                                }}
                            />
                            <Tooltip title="Enhance with AI">
                                <EnhanceButton
                                    loading={enhancingQualifications}
                                    onClick={handleAutoAwesomeQualifications}
                                >
                                    <AutoAwesome sx={{ fontSize: '20px' }} />
                                </EnhanceButton>
                            </Tooltip>
                        </Box>
                    </Stack>
                </Grid>

                {/* Email Signature Section */}
                <Grid size={{ xs: 12 }}>
                    <SectionHeader>
                        <IconContainer sx={{ 
                            backgroundColor: alpha(colors.warning, 0.1),
                            border: `1px solid ${alpha(colors.warning, 0.2)}`
                        }}>
                            <Email sx={{ color: colors.warning, fontSize: '20px' }} />
                        </IconContainer>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.25rem'
                            }}
                        >
                            Email Signature
                        </Typography>
                    </SectionHeader>

                    {signatureImageError && (
                        <Alert severity="error" sx={{ 
                            mb: 2,
                            borderRadius: '12px',
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                            {signatureImageError}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <LoadingButton
                            loading={generatingSignature}
                            variant="contained"
                            onClick={handleGenerateSignature}
                            startIcon={<AutoAwesome />}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                backgroundColor: colors.warning,
                                '&:hover': {
                                    backgroundColor: alpha(colors.warning, 0.9),
                                }
                            }}
                        >
                            Generate Signature
                        </LoadingButton>
                    </Box>

                    <Box sx={{ 
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        '& .tox-tinymce': {
                            border: 'none !important',
                        }
                    }}>
                        <Editor
                            onInit={(evt, editor) => signatureRef.current = editor}
                            tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                            value={signature}
                            onEditorChange={handleSignatureChange}
                            init={{
                                height: 270,
                                menubar: true,
                                relative_urls: false,
                                remove_script_host: false,
                                convert_urls: false,
                                plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                                    'emoticons', 'paste'
                                ],
                                toolbar: 'undo redo | blocks | ' +
                                    'bold italic forecolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | emoticons | help',
                                content_style: 'body { font-family:"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size:14px; max-width: 850px; overflow: hidden; padding: 16px; } img { max-height: 850px; }',
                                branding: false,
                                promotion: false,
                                resize: false,
                                images_upload_handler: (blobInfo, progress) => {
                                    return new Promise((resolve, reject) => {
                                        const formData = new FormData();
                                        formData.append('file', blobInfo.blob(), blobInfo.filename());
                                        
                                        axios.post('/public/upload', formData, {
                                            headers: { 'Content-Type': 'multipart/form-data' },
                                            onUploadProgress: (e) => {
                                                progress(e.loaded / e.total * 100);
                                            }
                                        })
                                        .then(response => {
                                            const imageId = response.data;
                                            resolve(`${backendBaseUrl}/public/${imageId}`);
                                        })
                                        .catch(error => {
                                            reject('Image upload failed: ' + (error.response?.data?.message || error.message));
                                            console.error('Error uploading image:', error);
                                        });
                                    });
                                },
                                paste_postprocess: (plugin, args) => {
                                    // Run after the paste is processed and content is in the editor
                                    setTimeout(() => {
                                        processExternalImages(signatureRef.current);
                                    }, 100);
                                },
                                setup: (editor) => {
                                    // Handle images pasted directly into the editor
                                    editor.on('paste', () => {
                                        setTimeout(() => {
                                            processExternalImages(editor);
                                        }, 100);
                                    });
                                    
                                    // Handle when content is set programmatically
                                    editor.on('SetContent', () => {
                                        setTimeout(() => {
                                            processExternalImages(editor);
                                        }, 100);
                                    });
                                }
                            }}
                        />
                    </Box>
                </Grid>

                {/* Error and Success Messages */}
                {error && (
                    <Grid size={{ xs: 12 }}>
                        <Alert severity="error" sx={{ 
                            borderRadius: '12px',
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                            {error}
                        </Alert>
                    </Grid>
                )}

                {successMessage && (
                    <Grid size={{ xs: 12 }}>
                        <Alert severity="success" sx={{ 
                            borderRadius: '12px',
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                            {successMessage}
                        </Alert>
                    </Grid>
                )}

                {/* Save Button */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                        <SaveButton
                            loading={saving || processingSignatureImage}
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                        >
                            Save Profile
                        </SaveButton>
                    </Box>
                </Grid>

                {/* Image Management Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleImageMenuClose}
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            border: `1px solid ${colors.border}`,
                            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        }
                    }}
                >
                    <MenuItem onClick={handleEditImage} sx={{ 
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '0.875rem'
                    }}>
                        <Edit sx={{ mr: 1, fontSize: '18px' }} /> Edit
                    </MenuItem>
                    <MenuItem onClick={handlePreviewImage} sx={{ 
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '0.875rem'
                    }}>
                        <Visibility sx={{ mr: 1, fontSize: '18px' }} /> Preview
                    </MenuItem>
                    <MenuItem onClick={handleRemoveImage} sx={{ 
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '0.875rem',
                        color: colors.error
                    }}>
                        <Delete sx={{ mr: 1, fontSize: '18px' }} /> Remove
                    </MenuItem>
                </Menu>

                {/* Hidden File Input */}
                <VisuallyHiddenInput
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                />

                {/* Image Preview Dialog */}
                {previewOpen && profileImageUrl && (
                    <Dialog
                        open={previewOpen}
                        onClose={handleClosePreview}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogContent>
                            <img
                                src={`${backendBaseUrl}${profileImageUrl}`}
                                alt="Profile Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '12px'
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </Grid>

            {/* Floating Notification in Portal */}
            <Portal>
                <Slide direction="up" in={hasUnsavedChanges} mountOnEnter unmountOnExit>
                    <FloatingNotification elevation={8}>
                        <Warning sx={{ color: colors.warning, fontSize: '20px' }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: colors.text.primary,
                                    marginBottom: '4px'
                                }}
                            >
                                Unsaved Changes
                            </Typography>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '0.75rem',
                                    color: colors.text.secondary,
                                    lineHeight: 1.4
                                }}
                            >
                                Your recent changes haven't been saved. To use AI features with new changes, please save first.
                            </Typography>
                        </Box>
                        <FloatingSaveButton
                            loading={saving || processingSignatureImage}
                            variant="contained"
                            onClick={handleSave}
                            size="small"
                        >
                            Save
                        </FloatingSaveButton>
                    </FloatingNotification>
                </Slide>
            </Portal>
        </ModernCard>
    );
};

export default PersonalProfileCard; 