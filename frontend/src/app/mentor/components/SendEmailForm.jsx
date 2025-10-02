import React, {useState, useRef} from "react";
import {
    IconButton,
    styled,
    Alert,
    Box,
    Chip,
    Stack,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    TextField,
    Button,
    Typography,
    alpha,
    Tooltip,
    Divider
} from "@mui/material";
import {H5} from "../../components/Typography.jsx";
import Grid from "@mui/material/Grid2";
import {
    Email,
    Send,
    AttachFile,
    Mail,
    AutoAwesome,
    Person,
    Subject,
    Description,
    Close
} from "@mui/icons-material";
import { Editor } from '@tinymce/tinymce-react';
import { useAxios } from '../../contexts/AxiosContext';
import LoadingButton from '@mui/lab/LoadingButton';
import { useAlert } from '../../contexts/AlertContext.jsx';

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

const ModernDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        background: colors.surface,
        overflow: 'hidden',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxHeight: '90vh',
    }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    padding: '32px 32px 0 32px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text.primary,
    lineHeight: 1.2,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: '24px 32px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: '24px 32px 32px 32px',
    borderTop: `1px solid ${colors.border}`,
    background: alpha(colors.background, 0.3),
    gap: '12px',
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
        },
        '&.Mui-disabled': {
            backgroundColor: alpha(colors.secondary, 0.05),
            '& fieldset': {
                borderColor: alpha(colors.border, 0.5),
            }
        }
    },
    '& .MuiInputBase-input': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
        '&.Mui-disabled': {
            color: colors.text.disabled,
            WebkitTextFillColor: colors.text.disabled,
        }
    },
    '& .MuiFormHelperText-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.75rem',
        marginLeft: '4px',
    }
}));

const ActionButton = styled(IconButton)(({ theme, variant: buttonVariant }) => ({
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ...(buttonVariant === 'direct' ? {
        backgroundColor: alpha(colors.primary, 0.1),
        color: colors.primary,
        border: `1px solid ${alpha(colors.primary, 0.2)}`,
        '&:hover': {
            backgroundColor: alpha(colors.primary, 0.15),
            transform: 'scale(1.05)',
        }
    } : {
        backgroundColor: alpha(colors.secondary, 0.1),
        color: colors.secondary,
        border: `1px solid ${alpha(colors.secondary, 0.2)}`,
        '&:hover': {
            backgroundColor: alpha(colors.secondary, 0.15),
            transform: 'scale(1.05)',
        }
    })
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
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

const ModernButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 24px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: buttonVariant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
    }
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

const AttachmentChip = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 500,
    borderRadius: '8px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    '& .MuiChip-deleteIcon': {
        color: colors.primary,
        '&:hover': {
            color: colors.error,
        }
    }
}));

const EditorContainer = styled(Box)(({ theme }) => ({
    border: `1.5px solid ${colors.border}`,
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'border-color 0.2s ease-in-out',
    '&:hover': {
        borderColor: colors.borderHover,
    },
    '&:focus-within': {
        borderColor: colors.primary,
        borderWidth: '2px',
    }
}));

const SendEmailForm = ({toEmailAddress, direct, keyword, id}) => {
    const [open, setOpen] = useState(false);
    const [emailContent, setEmailContent] = useState('');
    const [subject, setSubject] = useState('');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const axios = useAxios();
    const { showAlert } = useAlert();

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    const fetchTemplate = async () => {
        try {
            const { data } = await axios.get('/api/emails/template');
            setEmailContent(data);
        } catch (err) {
            console.error('Error fetching template:', err);
            showAlert('Error fetching email template', 'error');
        }
    };

    function handleClickOpen() {
        setOpen(true);
        setError('');
        setFiles([]);
        setSubject('');
        setEmailContent('');
        fetchTemplate(); // Fetch template when dialog opens
    }
    
    function handleClose() {
        setOpen(false);
        setError('');
        setFiles([]);
        setSubject('');
        setEmailContent('');
    }

    const handleEditorChange = (content, editor) => {
        setEmailContent(content);
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const invalidFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
        
        if (invalidFiles.length > 0) {
            setError(`Some files exceed 2MB: ${invalidFiles.map(f => f.name).join(', ')}`);
            return;
        }
        
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        setError('');
        // Reset file input
        event.target.value = '';
    };

    const removeFile = (fileToRemove) => {
        setFiles(files.filter(file => file !== fileToRemove));
    };

    const handleSendEmail = async () => {
        if (!subject.trim()) {
            setError('Please enter a subject');
            return;
        }

        if (!emailContent.trim()) {
            setError('Please enter email content');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('to', toEmailAddress);
        formData.append('subject', subject);
        formData.append('htmlBody', emailContent);
        files.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            await axios.post('/api/emails/with-attachments', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            showAlert('Email sent successfully', 'success');
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoAwesome = async () => {
        if (!id) {
            showAlert('ID is required for enhancement', 'error');
            return;
        }
        try {
            setEnhancing(true);
            const { data } = await axios.post('/api/ai/completion', {
                keyword: keyword,
                id: id,
                currentText: emailContent
            });
            setEmailContent(data);
            showAlert('Email content enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing email content:', error);
            showAlert('Error enhancing email content', 'error');
        } finally {
            setEnhancing(false);
        }
    };

    return (
        <>
            <Tooltip title="Send Email">
                <ActionButton 
                    onClick={handleClickOpen} 
                    variant={direct ? "direct" : "default"}
                    size="medium"
                >
                    {direct ? <Email sx={{fontSize: '20px'}}/> : <Mail sx={{fontSize: '20px'}}/>}
                </ActionButton>
            </Tooltip>

            <ModernDialog
                open={open}
                fullWidth={true}
                maxWidth="lg"
                onClose={handleClose}
                aria-labelledby="email-form-dialog"
            >
                <StyledDialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Box sx={{ 
                            padding: '12px', 
                            borderRadius: '12px', 
                            backgroundColor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Email sx={{ color: colors.primary, fontSize: '24px' }} />
                        </Box>
                        <Box>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 700,
                                    color: colors.text.primary,
                                    fontSize: '1.5rem',
                                    lineHeight: 1.2,
                                    marginBottom: '4px'
                                }}
                            >
                                Compose Email
                            </Typography>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.secondary,
                                    fontSize: '0.875rem'
                                }}
                            >
                                Send a personalized email with attachments
                            </Typography>
                        </Box>
                    </Box>
                </StyledDialogTitle>

                <StyledDialogContent>
                    <Stack spacing={3}>
                        {/* Recipient Section */}
                        <Box>
                            <FieldLabel>
                                <Person sx={{ fontSize: '14px' }} />
                                Recipient
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                value={toEmailAddress}
                                disabled
                                placeholder="Recipient email address"
                            />
                        </Box>

                        {/* Subject Section */}
                        <Box>
                            <FieldLabel>
                                <Subject sx={{ fontSize: '14px' }} />
                                Subject Line *
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter email subject"
                                error={!!error && !subject.trim()}
                            />
                        </Box>

                        {/* Email Body Section */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <FieldLabel>
                                    <Description sx={{ fontSize: '14px' }} />
                                    Email Content *
                                </FieldLabel>
                                {id && (
                                    <Tooltip title="Enhance with AI">
                                        <EnhanceButton
                                            loading={enhancing}
                                            onClick={handleAutoAwesome}
                                        >
                                            <AutoAwesome sx={{ fontSize: '20px' }}/>
                                        </EnhanceButton>
                                    </Tooltip>
                                )}
                            </Box>

                            <EditorContainer>
                                <Editor
                                    onInit={(evt, editor) => editorRef.current = editor}
                                    tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                                    value={emailContent}
                                    onEditorChange={handleEditorChange}
                                    init={{
                                        width: '100%',
                                        height: 700,
                                        relative_urls: false,
                                        remove_script_host: false,
                                        convert_urls: false,
                                        menubar: true,
                                        plugins: [
                                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                                            'emoticons'
                                        ],
                                        toolbar: 'undo redo | preview | fullscreen | blocks | ' +
                                            'bold italic forecolor | alignleft aligncenter ' +
                                            'alignright alignjustify | ' +
                                            'removeformat | bullist numlist outdent indent',
                                        content_style: `body { 
                                            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                                            font-size: 14px; 
                                            color: ${colors.text.primary};
                                            line-height: 1.6;
                                        }`,
                                        branding: false,
                                        promotion: false,
                                        resize: false,
                                        skin: 'oxide',
                                        content_css: false
                                    }}
                                />
                            </EditorContainer>
                        </Box>

                        {/* Attachments Section */}
                        <Box>
                            <SectionHeader>
                                <Box sx={{ 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    backgroundColor: alpha(colors.secondary, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <AttachFile sx={{ color: colors.secondary, fontSize: '18px' }} />
                                </Box>
                                <Typography 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Attachments
                                </Typography>
                            </SectionHeader>

                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                            />
                            <ModernButton
                                variant="outlined"
                                startIcon={<AttachFile />}
                                onClick={() => fileInputRef.current.click()}
                                sx={{
                                    color: colors.secondary,
                                    borderColor: colors.border,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.secondary, 0.05),
                                        borderColor: colors.borderHover,
                                    }
                                }}
                            >
                                Attach Files (Max 2MB each)
                            </ModernButton>
                            
                            {files.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: colors.text.secondary,
                                            marginBottom: '12px'
                                        }}
                                    >
                                        Attached Files ({files.length})
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                        {files.map((file, index) => (
                                            <AttachmentChip
                                                key={index}
                                                label={file.name}
                                                onDelete={() => removeFile(file)}
                                                deleteIcon={<Close sx={{ fontSize: '16px' }} />}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Box>

                        {/* Error Display */}
                        {error && (
                            <Alert 
                                severity="error" 
                                sx={{ 
                                    borderRadius: '12px',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                }}
                            >
                                {error}
                            </Alert>
                        )}
                    </Stack>
                </StyledDialogContent>

                <StyledDialogActions>
                    <ModernButton 
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            color: colors.text.secondary,
                            borderColor: colors.border,
                            '&:hover': {
                                backgroundColor: alpha(colors.secondary, 0.05),
                                borderColor: colors.borderHover,
                            }
                        }}
                    >
                        Cancel
                    </ModernButton>
                    <LoadingButton
                        loading={loading}
                        onClick={handleSendEmail}
                        variant="contained"
                        startIcon={<Send />}
                        sx={{
                            backgroundColor: colors.success,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            padding: '12px 24px',
                            '&:hover': {
                                backgroundColor: '#059669',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            }
                        }}
                    >
                        Send Email
                    </LoadingButton>
                </StyledDialogActions>
            </ModernDialog>
        </>
    );
};

export default SendEmailForm;