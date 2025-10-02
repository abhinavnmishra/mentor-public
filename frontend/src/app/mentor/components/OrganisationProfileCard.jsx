import {
    Card, 
    Divider, 
    IconButton, 
    styled, 
    Alert, 
    CircularProgress, 
    Menu, 
    MenuItem, 
    Button, 
    Tooltip,
    Typography,
    Box,
    Stack,
    alpha,
    Dialog,
    DialogContent,
    Slide,
    Paper,
    Portal
} from "@mui/material";
import {H3, H5} from '../../components/Typography.jsx';
import * as React from "react";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import {
    AddAPhoto, 
    AutoAwesome, 
    Save, 
    Edit, 
    Delete, 
    Visibility, 
    PhotoCamera,
    Business,
    Email,
    Language,
    Description,
    ViewDay,
    ViewAgenda,
    Palette,
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

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '24px'
}));

const EditorContainer = styled(Box)(({ theme }) => ({
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    overflow: 'hidden',
    '& .tox-tinymce': {
        border: 'none !important',
    }
}));

const EditorHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
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

const OrganisationProfileCard = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [about, setAbout] = useState('');
    const [header, setHeader] = useState('');
    const [footer, setFooter] = useState('');
    const [primaryBrandColor, setPrimaryBrandColor] = useState('#2563eb');
    const [secondaryBrandColor, setSecondaryBrandColor] = useState('#64748b');
    const [logoImageDescription, setLogoImageDescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [enhancingHeader, setEnhancingHeader] = useState(false);
    const [enhancingFooter, setEnhancingFooter] = useState(false);
    const [enhancingAbout, setEnhancingAbout] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState(false);
    const [logoImageUrl, setLogoImageUrl] = useState('');
    const [logoImageId, setLogoImageId] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [headerImageError, setHeaderImageError] = useState('');
    const [footerImageError, setFooterImageError] = useState('');
    const [processingHeaderImage, setProcessingHeaderImage] = useState(false);
    const [processingFooterImage, setProcessingFooterImage] = useState(false);
    const [headerImageId, setHeaderImageId] = useState('');
    const [footerImageId, setFooterImageId] = useState('');
    const fileInputRef = useRef(null);
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

    // State for tracking unsaved changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [originalData, setOriginalData] = useState({});

    const headerRef = useRef(null);
    const footerRef = useRef(null);
    const { user } = useAuth();
    const organisationId = user.organisationId;
    const axios = useAxios();

    useEffect(() => {
        fetchOrganisationProfile();
    }, [organisationId]);

    // Memoize current data to prevent unnecessary re-renders
    const currentData = useMemo(() => ({
        name: name || '',
        email: email || '',
        website: website || '',
        about: about || '',
        header: header || '',
        footer: footer || '',
        primaryBrandColor: primaryBrandColor || '#2563eb',
        secondaryBrandColor: secondaryBrandColor || '#64748b',
        logoImageUrl: logoImageUrl || ''
    }), [name, email, website, about, header, footer, primaryBrandColor, secondaryBrandColor, logoImageUrl]);

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

    const fetchOrganisationProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`/api/trainers/organisations/profile`);
            const data = response.data;
            
            setName(data.name || '');
            setEmail(data.email || '');
            setWebsite(data.website || '');
            setAbout(data.about || '');
            setHeader(data.header || '');
            setFooter(data.footer || '');
            setLogoImageUrl(data.logoImageUrl || '');
            setHeaderImageId(data.headerImageId || '');
            setFooterImageId(data.footerImageId || '');
            setPrimaryBrandColor(data.primaryBrandColor || '#2563eb');
            setSecondaryBrandColor(data.secondaryBrandColor || '#64748b');
            setLogoImageDescription(data.logoImageDescription || null);
            
            // Store original data for comparison
            setOriginalData({
                name: data.name || '',
                email: data.email || '',
                website: data.website || '',
                about: data.about || '',
                header: data.header || '',
                footer: data.footer || '',
                primaryBrandColor: data.primaryBrandColor || '#2563eb',
                secondaryBrandColor: data.secondaryBrandColor || '#64748b',
                logoImageUrl: data.logoImageUrl || ''
            });
            
            // Extract logoImageId from logoImageUrl if it exists
            if (data.logoImageUrl && data.logoImageUrl.includes('/public/')) {
                const imageId = data.logoImageUrl.split('/public/')[1];
                setLogoImageId(imageId);
            }
        } catch (err) {
            setError('Failed to load organization profile data');
            console.error('Error fetching organization profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleHeaderChange = (content, editor) => {
        setHeader(content);
    };

    const handleFooterChange = (content, editor) => {
        setFooter(content);
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
                    errors.push(`Failed to download image from source. Please remove this image as it might not be rendered in the way you expect. Source :  ${imgSrc}: ${error.message || 'Unknown error'}`);
                    // We don't modify this image if download fails
                }
            }
        }
        
        // Set appropriate error state based on which editor had errors
        if (errors.length > 0) {
            const errorMessage = errors.join('; ');
            if (editor === headerRef.current) {
                setHeaderImageError(errorMessage);
            } else if (editor === footerRef.current) {
                setFooterImageError(errorMessage);
            }
        } else {
            // Clear errors if no issues occurred
            if (editor === headerRef.current) {
                setHeaderImageError('');
            } else if (editor === footerRef.current) {
                setFooterImageError('');
            }
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
            if (editor === headerRef.current) {
                setHeader(newContent);
            } else if (editor === footerRef.current) {
                setFooter(newContent);
            }
        }
        
        // Hide loading indicator
        editor.setProgressState(false);
    };

    const convertAndUploadHtml = async (editor, type) => {
        try {
            const setProcessing = type === 'header' ? setProcessingHeaderImage : setProcessingFooterImage;
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
                        
                        // Create entity ID with concatenation of organisationId and type suffix
                        const entityId = `${organisationId}-${type}`;
                        
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
            const setProcessing = type === 'header' ? setProcessingHeaderImage : setProcessingFooterImage;
            setProcessing(false);
            throw err;
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccessMessage('');
            
            // Variables to store the image IDs
            let headerImgId = headerImageId;
            let footerImgId = footerImageId;

            // First convert and upload the HTML content as images
            if (headerRef.current) {
                headerImgId = await convertAndUploadHtml(headerRef.current, 'header');
                setHeaderImageId(headerImgId);
            }
            
            if (footerRef.current) {
                footerImgId = await convertAndUploadHtml(footerRef.current, 'footer');
                setFooterImageId(footerImgId);
            }

            const updateData = {
                name,
                email,
                website,
                about,
                header,
                footer,
                logoImageUrl,
                headerImageId: headerImgId,
                footerImageId: footerImgId,
                primaryBrandColor,
                secondaryBrandColor,
                logoImageDescription
            };

            const response = await axios.put(`/api/trainers/organisations/profile`, updateData);
            const updatedData = response.data;

            // Update form with returned data
            setName(updatedData.name || '');
            setEmail(updatedData.email || '');
            setWebsite(updatedData.website || '');
            setAbout(updatedData.about || '');
            setHeader(updatedData.header || '');
            setFooter(updatedData.footer || '');
            setLogoImageUrl(updatedData.logoImageUrl || '');
            setPrimaryBrandColor(updatedData.primaryBrandColor || '#2563eb');
            setSecondaryBrandColor(updatedData.secondaryBrandColor || '#64748b');
            setLogoImageDescription(updatedData.logoImageDescription || null);
            // Update the image IDs if they're returned
            if (updatedData.headerImageId) setHeaderImageId(updatedData.headerImageId);
            if (updatedData.footerImageId) setFooterImageId(updatedData.footerImageId);

            // Update original data to reflect saved state
            setOriginalData({
                name: updatedData.name || '',
                email: updatedData.email || '',
                website: updatedData.website || '',
                about: updatedData.about || '',
                header: updatedData.header || '',
                footer: updatedData.footer || '',
                primaryBrandColor: updatedData.primaryBrandColor || '#2563eb',
                secondaryBrandColor: updatedData.secondaryBrandColor || '#64748b',
                logoImageUrl: updatedData.logoImageUrl || ''
            });

            setSuccessMessage('Organization profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update organization profile');
            console.error('Error updating organization profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleAutoAwesomeHeader = async () => {
        if (!organisationId) {
            setError('Organization ID is required');
            return;
        }

        setEnhancingHeader(true);
        try {
            const response = await axios.post('/api/ai/completion', {
                keyword: 'trainer_org_email_header',
                id: organisationId,
                currentText: header
            });

            setHeader(response.data);
            setSuccessMessage('Email header enhanced successfully');
        } catch (err) {
            setError('Failed to enhance email header');
            console.error('Error enhancing email header:', err);
        } finally {
            setEnhancingHeader(false);
        }
    };

    const handleAutoAwesomeFooter = async () => {
        if (!organisationId) {
            setError('Organization ID is required');
            return;
        }

        setEnhancingFooter(true);
        try {
            const response = await axios.post('/api/ai/completion', {
                keyword: 'trainer_org_email_footer',
                id: organisationId,
                currentText: footer
            });

            setFooter(response.data);
            setSuccessMessage('Email footer enhanced successfully');
        } catch (err) {
            setError('Failed to enhance email footer');
            console.error('Error enhancing email footer:', err);
        } finally {
            setEnhancingFooter(false);
        }
    };

    const handleAutoAwesomeAbout = async () => {
        if (!organisationId) {
            setError('Organization ID is required');
            return;
        }

        setEnhancingAbout(true);
        try {
            const response = await axios.post('/api/ai/completion', {
                keyword: 'trainer_org_about',
                id: organisationId,
                currentText: about
            });

            setAbout(response.data);
            setSuccessMessage('About enhanced successfully');
        } catch (err) {
            setError('Failed to enhance about');
            console.error('Error enhancing about:', err);
        } finally {
            setEnhancingAbout(false);
        }
    };

    const analyzeLogoImage = async (imageId) => {
        try {
            setAnalyzingImage(true);
            const response = await axios.post(`/api/image-analysis/analyze/${imageId}`);
            const analysisData = response.data;
            
            // Update brand colors and logo description if analysis provides them
            if (analysisData.primaryColor) {
                setPrimaryBrandColor(analysisData.primaryColor);
            }
            if (analysisData.secondaryColor) {
                setSecondaryBrandColor(analysisData.secondaryColor);
            }
            
            // Set the logo image description from analysis
            setLogoImageDescription(analysisData);
            
            setSuccessMessage('Logo analyzed successfully! Brand colors have been extracted.');
        } catch (err) {
            console.error('Error analyzing logo:', err);
            // Don't show error to user as this is optional enhancement
        } finally {
            setAnalyzingImage(false);
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
            setLogoImageId(imageId);
            setLogoImageUrl(`/public/${imageId}`);
            
            // Analyze the uploaded image for brand colors
            await analyzeLogoImage(imageId);
            
            setSuccessMessage('Logo uploaded successfully');
        } catch (err) {
            setError('Failed to upload logo');
            console.error('Error uploading logo:', err);
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
        setLogoImageUrl('');
        setLogoImageDescription(null); // Clear the logo description when removing image
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
                        Loading organization profile...
                    </Typography>
                </LoadingContainer>
            </ModernCard>
        );
    }

    return (
        <>
            <ModernCard>
                <Grid container spacing={4}>
                    {/* Header Section */}
                    <Grid size={{ xs: 12 }}>
                        <SectionHeader>
                            <IconContainer sx={{ 
                                backgroundColor: alpha(colors.primary, 0.1),
                                border: `1px solid ${alpha(colors.primary, 0.2)}`
                            }}>
                                <Business sx={{ color: colors.primary, fontSize: '20px' }} />
                            </IconContainer>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    fontSize: '1.25rem'
                                }}
                            >
                                Organization Information
                            </Typography>
                        </SectionHeader>
                    </Grid>

                    {/* Logo Section */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <LogoContainer>
                            <Box sx={{ position: 'relative' }}>
                                {!logoImageUrl ? (
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
                                        <AddAPhoto sx={{fontSize: '50px'}}/>
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
                                        src={`${backendBaseUrl}${logoImageUrl}`}
                                        onClick={handleImageMenuOpen}
                                        sx={{
                                            height: '200px',
                                            width: 'auto',
                                            maxWidth: '300px',
                                            cursor: 'pointer',
                                            objectFit: 'contain',
                                            border: `3px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'scale(1.02)',
                                                borderColor: colors.primary,
                                            }
                                        }}
                                    />
                                )}
                                {logoImageUrl && (
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
                                {uploadingImage ? 'Uploading...' : logoImageUrl ? 'Click to manage logo' : 'Click to upload logo'}
                            </Typography>
                        </LogoContainer>
                    </Grid>

                    {/* Basic Information Section */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Stack spacing={3}>
                            <Box>
                                <FieldLabel>
                                    <Business sx={{ fontSize: '14px' }} />
                                    Organization Name
                                </FieldLabel>
                                <StyledTextField
                                    fullWidth
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter organization name"
                                />
                            </Box>

                            <Box>
                                <FieldLabel>
                                    <Email sx={{ fontSize: '14px' }} />
                                    Contact Email
                                </FieldLabel>
                                <StyledTextField
                                    fullWidth
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter contact email"
                                />
                            </Box>

                            <Box>
                                <FieldLabel>
                                    <Language sx={{ fontSize: '14px' }} />
                                    Website
                                </FieldLabel>
                                <StyledTextField
                                    fullWidth
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="Enter website URL"
                                />
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Brand Colors Section */}
                    <Grid size={{ xs: 12 }}>
                        <SectionHeader>
                            <IconContainer sx={{ 
                                backgroundColor: alpha(colors.warning, 0.1),
                                border: `1px solid ${alpha(colors.warning, 0.2)}`
                            }}>
                                <Palette sx={{ color: colors.warning, fontSize: '20px' }} />
                            </IconContainer>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    fontSize: '1.25rem'
                                }}
                            >
                                Brand Colors
                            </Typography>
                            {analyzingImage && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                                    <CircularProgress size={16} sx={{ color: colors.warning }} />
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.75rem',
                                            color: colors.text.secondary
                                        }}
                                    >
                                        Analyzing logo...
                                    </Typography>
                                </Box>
                            )}
                        </SectionHeader>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FieldLabel>
                                    <Palette sx={{ fontSize: '14px' }} />
                                    Primary Brand Color
                                </FieldLabel>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        component="input"
                                        type="color"
                                        value={primaryBrandColor}
                                        onChange={(e) => setPrimaryBrandColor(e.target.value)}
                                        sx={{
                                            width: '60px',
                                            height: '48px',
                                            border: `2px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                borderColor: colors.primary,
                                            }
                                        }}
                                    />
                                    <StyledTextField
                                        fullWidth
                                        value={primaryBrandColor}
                                        onChange={(e) => setPrimaryBrandColor(e.target.value)}
                                        placeholder="#2563eb"
                                        inputProps={{
                                            pattern: "^#[0-9A-Fa-f]{6}$",
                                            title: "Enter a valid hex color (e.g., #2563eb)"
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FieldLabel>
                                    <Palette sx={{ fontSize: '14px' }} />
                                    Secondary Brand Color
                                </FieldLabel>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        component="input"
                                        type="color"
                                        value={secondaryBrandColor}
                                        onChange={(e) => setSecondaryBrandColor(e.target.value)}
                                        sx={{
                                            width: '60px',
                                            height: '48px',
                                            border: `2px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                borderColor: colors.primary,
                                            }
                                        }}
                                    />
                                    <StyledTextField
                                        fullWidth
                                        value={secondaryBrandColor}
                                        onChange={(e) => setSecondaryBrandColor(e.target.value)}
                                        placeholder="#64748b"
                                        inputProps={{
                                            pattern: "^#[0-9A-Fa-f]{6}$",
                                            title: "Enter a valid hex color (e.g., #64748b)"
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.75rem',
                                color: colors.text.secondary,
                                marginTop: '12px',
                                fontStyle: 'italic'
                            }}
                        >
                            💡 Tip: Upload a logo above to automatically extract brand colors using AI analysis
                        </Typography>
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
                                About Organization
                            </Typography>
                        </SectionHeader>

                        <Box sx={{ position: 'relative' }}>
                            <FieldLabel>
                                <Description sx={{ fontSize: '14px' }} />
                                Organization Description
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                multiline
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                placeholder="Detailed information about your organization, mission, and values..."
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '150px',
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
                                    loading={enhancingAbout}
                                    onClick={handleAutoAwesomeAbout}
                                    sx={{
                                        position: 'absolute',
                                        right: '16px',
                                        top: '32px',
                                    }}
                                >
                                    <AutoAwesome sx={{ fontSize: '20px' }} />
                                </EnhanceButton>
                            </Tooltip>
                        </Box>
                    </Grid>

                    {/* Email Header Section */}
                    <Grid size={{ xs: 12 }}>
                        <SectionHeader>
                            <IconContainer sx={{ 
                                backgroundColor: alpha(colors.warning, 0.1),
                                border: `1px solid ${alpha(colors.warning, 0.2)}`
                            }}>
                                <ViewDay sx={{ color: colors.warning, fontSize: '20px' }} />
                            </IconContainer>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    fontSize: '1.25rem'
                                }}
                            >
                                Email Header Template
                            </Typography>
                        </SectionHeader>

                        <Box>
                            <EditorHeaderContainer>
                                <FieldLabel>
                                    <ViewDay sx={{ fontSize: '14px' }} />
                                    Design your email header
                                </FieldLabel>
                                <Tooltip title="Enhance with AI">
                                    <EnhanceButton
                                        loading={enhancingHeader}
                                        onClick={handleAutoAwesomeHeader}
                                    >
                                        <AutoAwesome sx={{ fontSize: '20px' }} />
                                    </EnhanceButton>
                                </Tooltip>
                            </EditorHeaderContainer>

                            {headerImageError && (
                                <Alert severity="error" sx={{ 
                                    mb: 2,
                                    borderRadius: '12px',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}>
                                    {headerImageError}
                                </Alert>
                            )}

                            <EditorContainer>
                                <Editor
                                    onInit={(evt, editor) => headerRef.current = editor}
                                    tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                                    value={header}
                                    onEditorChange={handleHeaderChange}
                                    init={{
                                        height: 400,
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
                                                processExternalImages(headerRef.current);
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
                            </EditorContainer>
                        </Box>
                    </Grid>

                    {/* Email Footer Section */}
                    <Grid size={{ xs: 12 }}>
                        <SectionHeader>
                            <IconContainer sx={{ 
                                backgroundColor: alpha(colors.error, 0.1),
                                border: `1px solid ${alpha(colors.error, 0.2)}`
                            }}>
                                <ViewAgenda sx={{ color: colors.error, fontSize: '20px' }} />
                            </IconContainer>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    fontSize: '1.25rem'
                                }}
                            >
                                Email Footer Template
                            </Typography>
                        </SectionHeader>

                        <Box>
                            <EditorHeaderContainer>
                                <FieldLabel>
                                    <ViewAgenda sx={{ fontSize: '14px' }} />
                                    Design your email footer
                                </FieldLabel>
                                <Tooltip title="Enhance with AI">
                                    <EnhanceButton
                                        loading={enhancingFooter}
                                        onClick={handleAutoAwesomeFooter}
                                    >
                                        <AutoAwesome sx={{ fontSize: '20px' }} />
                                    </EnhanceButton>
                                </Tooltip>
                            </EditorHeaderContainer>

                            {footerImageError && (
                                <Alert severity="error" sx={{ 
                                    mb: 2,
                                    borderRadius: '12px',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}>
                                    {footerImageError}
                                </Alert>
                            )}

                            <EditorContainer>
                                <Editor
                                    onInit={(evt, editor) => footerRef.current = editor}
                                    tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                                    value={footer}
                                    onEditorChange={handleFooterChange}
                                    init={{
                                        height: 400,
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
                                                processExternalImages(footerRef.current);
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
                            </EditorContainer>
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
                                loading={saving || processingHeaderImage || processingFooterImage || analyzingImage}
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
                    {previewOpen && logoImageUrl && (
                        <Dialog
                            open={previewOpen}
                            onClose={handleClosePreview}
                            PaperProps={{
                                sx: {
                                    maxWidth: '90%',
                                    maxHeight: '90%',
                                    objectFit: 'contain',
                                    borderRadius: '12px'
                                }
                            }}
                        >
                            <DialogContent>
                                <img
                                    src={`${backendBaseUrl}${logoImageUrl}`}
                                    alt="Logo Preview"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        borderRadius: '12px'
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </Grid>
            </ModernCard>

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
                            loading={saving || processingHeaderImage || processingFooterImage || analyzingImage}
                            variant="contained"
                            onClick={handleSave}
                            size="small"
                        >
                            Save
                        </FloatingSaveButton>
                    </FloatingNotification>
                </Slide>
            </Portal>
        </>
    );
};

export default OrganisationProfileCard; 