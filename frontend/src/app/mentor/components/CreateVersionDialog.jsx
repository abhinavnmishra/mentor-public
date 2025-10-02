import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    Select,
    MenuItem,
    styled,
    alpha,
    Stack,
    Paper,
    Divider,
    Chip
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
    FileCopy, 
    Add, 
    ContentCopy, 
    NoteAdd, 
    Close, 
    Save,
    Description,
    Layers
} from '@mui/icons-material';
import { useAxios } from '../../contexts/AxiosContext.jsx';
import { useAlert } from '../../contexts/AlertContext.jsx';

// Modern color palette (consistent with other components)
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

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '20px',
        padding: '8px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        overflow: 'hidden'
    }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    padding: '32px 32px 16px',
    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    color: 'white',
    margin: '-8px -8px 0',
    borderBottom: `1px solid ${colors.border}`,
}));

const TitleContent = styled(Stack)(({ theme }) => ({
    direction: 'row',
    spacing: 2,
    alignItems: 'center',
}));

const TitleIcon = styled(Box)(({ theme }) => ({
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: alpha('#ffffff', 0.15),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const TitleText = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
    margin: 0,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: '32px',
    backgroundColor: colors.surface,
}));

const IntroText = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    color: colors.text.secondary,
    marginBottom: '24px',
    lineHeight: 1.6,
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
    gap: '16px',
}));

const OptionCard = styled(Paper)(({ theme, selected }) => ({
    padding: '20px',
    borderRadius: '12px',
    border: `2px solid ${selected ? colors.primary : colors.border}`,
    backgroundColor: selected ? alpha(colors.primary, 0.03) : colors.surface,
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        borderColor: selected ? colors.primary : colors.borderHover,
        backgroundColor: selected ? alpha(colors.primary, 0.05) : alpha(colors.background, 0.5),
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }
}));

const OptionHeader = styled(Stack)(({ theme }) => ({
    direction: 'row',
    spacing: 2,
    alignItems: 'center',
    marginBottom: '8px',
}));

const OptionIcon = styled(Box)(({ theme, selected }) => ({
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: selected ? alpha(colors.primary, 0.1) : alpha(colors.secondary, 0.1),
    color: selected ? colors.primary : colors.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out',
}));

const OptionTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text.primary,
    margin: 0,
}));

const OptionDescription = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    color: colors.text.secondary,
    lineHeight: 1.5,
    marginTop: '4px',
}));

const StyledRadio = styled(Radio)(({ theme }) => ({
    color: colors.border,
    '&.Mui-checked': {
        color: colors.primary,
    },
    '& .MuiSvgIcon-root': {
        fontSize: '20px',
    }
}));

const SourceVersionSection = styled(Box)(({ theme }) => ({
    marginTop: '24px',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.03),
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text.primary,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    borderRadius: '12px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: colors.surface,
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.border,
        borderWidth: '1.5px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.borderHover,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.primary,
        borderWidth: '2px',
    },
    '& .MuiSelect-select': {
        padding: '12px 16px',
        fontSize: '0.875rem',
        color: colors.text.primary,
    }
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    padding: '12px 16px',
    borderRadius: '8px',
    margin: '4px 8px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.08),
        borderRadius: '8px',
    },
    '&.Mui-selected': {
        backgroundColor: alpha(colors.primary, 0.12),
        '&:hover': {
            backgroundColor: alpha(colors.primary, 0.16),
        }
    }
}));

const VersionChip = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    height: '28px',
    '& .MuiChip-icon': {
        color: colors.primary,
    }
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: '24px 32px 32px',
    backgroundColor: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    margin: '0 -8px -8px',
    gap: '12px',
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 24px',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-1px)',
    }
}));

const CancelButton = styled(ActionButton)(({ theme }) => ({
    borderColor: colors.border,
    color: colors.text.secondary,
    '&:hover': {
        borderColor: colors.secondary,
        backgroundColor: alpha(colors.secondary, 0.05),
        color: colors.secondary,
    }
}));

const CreateButton = styled(LoadingButton)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: 'white',
    minWidth: '140px',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: colors.primaryLight,
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
        transform: 'translateY(-1px)',
    },
    '&:disabled': {
        backgroundColor: alpha(colors.primary, 0.5),
        color: 'white',
    }
}));

const StyledNewVersionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 20px',
    backgroundColor: alpha('#ffffff', 0.95),
    color: colors.text.primary,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: '#ffffff',
        borderColor: colors.primary,
        color: colors.primary,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateY(-1px)',
    }
}));

/**
 * Dialog component for creating new report versions
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onClose - Function to call when dialog is closed
 * @param {string} programId - ID of the current program
 * @param {Array} versions - Available report versions
 * @param {function} onVersionCreated - Callback after version is created
 */
const CreateVersionDialog = ({ open, onClose, programId, versions, onVersionCreated }) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    
    const [newVersionType, setNewVersionType] = useState('fresh');
    const [sourceVersion, setSourceVersion] = useState(null);
    const [creatingVersion, setCreatingVersion] = useState(false);

    // Reset state when dialog opens
    React.useEffect(() => {
        if (open) {
            setNewVersionType('fresh');
            setSourceVersion(null);
        }
    }, [open]);

    // Handler for radio button selection
    const handleVersionTypeChange = (event) => {
        setNewVersionType(event.target.value);
    };

    // Handler for source version selection
    const handleSourceVersionChange = (event) => {
        const selectedVersion = versions.find(v => v.count === event.target.value);
        setSourceVersion(selectedVersion);
    };

    // Handler to create a new version
    const handleCreateVersion = async () => {
        try {
            setCreatingVersion(true);
            
            let url = `/api/reports/initialize/${programId}`;
            
            // For cloning, add the version as a query parameter
            if (newVersionType === 'clone' && sourceVersion) {
                url += `?version=${sourceVersion.count}`;
            }
            
            // Make a GET request instead of POST
            const { data: reportData } = await axiosInstance.get(url);
            
            // Refresh the versions list
            const versionsResponse = await axiosInstance.get(`/api/reports/versions/${programId}`);
            
            // Call onVersionCreated with both new versions and the report data
            if (onVersionCreated) {
                onVersionCreated(versionsResponse.data, reportData);
            }
            
            showAlert('New report version created successfully', 'success');
            onClose();
        } catch (error) {
            console.error('Error creating new version:', error);
            showAlert('Failed to create new report version', 'error');
        } finally {
            setCreatingVersion(false);
        }
    };

    const versionOptions = [
        {
            value: 'fresh',
            icon: <NoteAdd sx={{ fontSize: '20px' }} />,
            title: 'Create Fresh Report',
            description: 'Start with a new blank report structure with default sections and templates.'
        },
        {
            value: 'clone',
            icon: <ContentCopy sx={{ fontSize: '20px' }} />,
            title: 'Clone from Existing Version',
            description: 'Copy all data, content, and configurations from an existing report version.'
        }
    ];

    return (
        <StyledDialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <StyledDialogTitle>
                <TitleContent direction="row" spacing={2} alignItems="center">
                    <TitleIcon>
                        <Layers sx={{ fontSize: '24px', color: 'white' }} />
                    </TitleIcon>
                    <TitleText>
                        Create New Report Version
                    </TitleText>
                </TitleContent>
            </StyledDialogTitle>
            
            <StyledDialogContent>
                <IntroText>
                    Select how you would like to create your new report version. You can start fresh or clone from an existing version.
                </IntroText>
                
                <StyledRadioGroup
                    value={newVersionType}
                    onChange={handleVersionTypeChange}
                >
                    {versionOptions.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            value={option.value}
                            control={<StyledRadio />}
                            label={
                                <OptionCard 
                                    elevation={0} 
                                    selected={newVersionType === option.value}
                                    onClick={() => setNewVersionType(option.value)}
                                >
                                    <OptionHeader direction="row" spacing={2} alignItems="center">
                                        <OptionIcon selected={newVersionType === option.value}>
                                            {option.icon}
                                        </OptionIcon>
                                        <OptionTitle>
                                            {option.title}
                                        </OptionTitle>
                                    </OptionHeader>
                                    <OptionDescription>
                                        {option.description}
                                    </OptionDescription>
                                </OptionCard>
                            }
                            sx={{ 
                                margin: 0,
                                width: '100%',
                                '& .MuiFormControlLabel-label': {
                                    width: '100%'
                                }
                            }}
                        />
                    ))}
                </StyledRadioGroup>

                {newVersionType === 'clone' && (
                    <SourceVersionSection>
                        <SectionLabel>
                            <Description sx={{ fontSize: '16px' }} />
                            Select source version to clone:
                        </SectionLabel>
                        <FormControl fullWidth>
                            <StyledSelect
                                value={sourceVersion?.count || ''}
                                onChange={handleSourceVersionChange}
                                displayEmpty
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                                            border: `1px solid ${colors.border}`,
                                            marginTop: '8px',
                                            '& .MuiList-root': {
                                                padding: '8px',
                                            }
                                        }
                                    }
                                }}
                            >
                                <StyledMenuItem value="" disabled>
                                    <Typography sx={{ 
                                        color: colors.text.disabled,
                                        fontStyle: 'italic'
                                    }}>
                                        Select version to clone
                                    </Typography>
                                </StyledMenuItem>
                                {versions.map((version) => (
                                    <StyledMenuItem key={version.count} value={version.count}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <VersionChip
                                                icon={<Layers sx={{ fontSize: '14px' }} />}
                                                label={`Version ${version.count}`}
                                                size="small"
                                            />
                                            <Typography sx={{ 
                                                fontSize: '0.875rem',
                                                color: colors.text.secondary
                                            }}>
                                                {version.createdAt ? new Date(version.createdAt).toLocaleDateString() : 'No date'}
                                            </Typography>
                                        </Stack>
                                    </StyledMenuItem>
                                ))}
                            </StyledSelect>
                        </FormControl>
                    </SourceVersionSection>
                )}
            </StyledDialogContent>
            
            <StyledDialogActions>
                <CancelButton 
                    variant="outlined" 
                    onClick={onClose}
                    startIcon={<Close sx={{ fontSize: '16px' }} />}
                >
                    Cancel
                </CancelButton>
                <CreateButton 
                    loading={creatingVersion}
                    onClick={handleCreateVersion} 
                    variant="contained"
                    disabled={newVersionType === 'clone' && !sourceVersion}
                    startIcon={creatingVersion ? null : <Add sx={{ fontSize: '16px' }} />}
                >
                    {creatingVersion ? 'Creating...' : 'Create Version'}
                </CreateButton>
            </StyledDialogActions>
        </StyledDialog>
    );
};

// Also export a button component that can be used to open this dialog
export const NewVersionButton = ({ onClick }) => {
    return (
        <StyledNewVersionButton 
            variant="outlined" 
            startIcon={<FileCopy sx={{ fontSize: '16px' }} />}
            onClick={onClick}
        >
            New Version
        </StyledNewVersionButton>
    );
};

export default CreateVersionDialog; 