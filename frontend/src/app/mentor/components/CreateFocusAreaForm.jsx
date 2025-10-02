import React, {useState} from "react";
import {H5} from "../../components/Typography.jsx";
import Grid from "@mui/material/Grid2";
import {
    IconButton, 
    styled, 
    FormControlLabel, 
    Switch,
    alpha,
    Box,
    Typography,
    Stack,
    Chip,
    Tooltip,
    Fade,
    Paper,
    Divider
} from "@mui/material";
import TextField from "@mui/material/TextField";
import {
    Adjust,
    Draw,
    Add,
    Edit,
    AutoAwesome,
    FolderSpecial,
    AccountTree,
    Description,
    CheckCircle,
    Close,
    Save
} from "@mui/icons-material";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import LoadingButton from "@mui/lab/LoadingButton";

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

const DialogRoot = styled('div')(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

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
    backgroundColor: alpha(colors.primary, 0.02),
    borderBottom: `1px solid ${colors.border}`,
    margin: '-8px -8px 0',
}));

const TitleContent = styled(Stack)(({ theme }) => ({
    direction: 'row',
    spacing: 2,
    alignItems: 'center',
}));

const TitleIcon = styled(Box)(({ theme }) => ({
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const TitleText = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text.primary,
    margin: 0,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: '32px',
    backgroundColor: colors.surface,
}));

const FormSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginTop: '8px',
}));

const FieldContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
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
        backgroundColor: colors.surface,
        transition: 'all 0.2s ease-in-out',
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
        lineHeight: 1.6,
        '&::placeholder': {
            color: colors.text.disabled,
            opacity: 1,
        }
    },
    '& .MuiFormHelperText-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.75rem',
        marginLeft: '4px',
        '&.Mui-error': {
            color: colors.error,
        }
    }
}));

const EnhanceButton = styled(LoadingButton)(({ theme }) => ({
    position: 'absolute',
    right: '16px',
    top: '16px',
    width: '40px',
    height: '40px',
    minWidth: '40px',
    borderRadius: '10px',
    backgroundColor: alpha(colors.warning, 0.1),
    color: colors.warning,
    border: `1px solid ${alpha(colors.warning, 0.2)}`,
    transition: 'all 0.2s ease-in-out',
    zIndex: 1,
    '&:hover': {
        backgroundColor: alpha(colors.warning, 0.15),
        borderColor: colors.warning,
        transform: 'scale(1.05)',
    },
    '&.Mui-disabled': {
        backgroundColor: alpha(colors.secondary, 0.05),
        color: colors.text.disabled,
        borderColor: colors.border,
    }
}));

const SwitchContainer = styled(Paper)(({ theme }) => ({
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.03),
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
}));

const SwitchIcon = styled(Box)(({ theme }) => ({
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: alpha(colors.primary, 0.1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase': {
        '&.Mui-checked': {
            color: colors.primary,
            '& + .MuiSwitch-track': {
                backgroundColor: colors.primary,
            },
        },
    },
    '& .MuiSwitch-track': {
        backgroundColor: colors.border,
    },
}));

const SwitchLabel = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text.primary,
    flex: 1,
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

const SubmitButton = styled(ActionButton)(({ theme }) => ({
    backgroundColor: colors.primary,
    color: 'white',
    minWidth: '120px',
    '&:hover': {
        backgroundColor: colors.primaryLight,
    },
    '&:disabled': {
        backgroundColor: alpha(colors.primary, 0.5),
        color: 'white',
    }
}));

const ModernIconButton = styled(IconButton)(({ theme }) => ({
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: alpha(colors.primary, 0.08),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.12),
        borderColor: alpha(colors.primary, 0.3),
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${alpha(colors.primary, 0.15)}`,
    },
    '&:active': {
        transform: 'translateY(0px)',
        transition: 'transform 0.1s ease',
    },
    '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    }
}));

const AddButton = styled(IconButton)(({ theme }) => ({
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: alpha(colors.success, 0.08),
    color: colors.success,
    border: `1px solid ${alpha(colors.success, 0.2)}`,
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        backgroundColor: alpha(colors.success, 0.12),
        borderColor: alpha(colors.success, 0.3),
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${alpha(colors.success, 0.15)}`,
    },
    '&:active': {
        transform: 'translateY(0px)',
        transition: 'transform 0.1s ease',
    },
    '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    }
}));

const StatusChip = styled(Chip)(({ theme, isparent }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: isparent ? alpha(colors.primary, 0.1) : alpha(colors.secondary, 0.1),
    color: isparent ? colors.primary : colors.secondary,
    border: `1px solid ${isparent ? alpha(colors.primary, 0.2) : alpha(colors.secondary, 0.2)}`,
    height: '28px',
    '& .MuiChip-icon': {
        color: isparent ? colors.primary : colors.secondary,
    }
}));

const CreateFocusAreaForm = ({ 
    onOperation, 
    focusArea, 
    buttonType = "default", 
    coachingProgramId, 
    parentId, 
    isParent = false,
    customButtonProps = null
}) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [enhancingObjective, setEnhancingObjective] = useState(false);
    const [enhancingDescription, setEnhancingDescription] = useState(false);
    const [enhancingCriteria, setEnhancingCriteria] = useState(false);
    const [errors, setErrors] = useState({
        name: false,
        objective: false,
        description: false,
        criteria: false
    });
    const [formData, setFormData] = useState({
        id: focusArea?.id || null,
        name: focusArea?.name || '',
        objective: focusArea?.objective || '',
        description: focusArea?.description || '',
        criteria: focusArea?.criteria || '',
        coachingProgram: coachingProgramId,
        parentId: focusArea?.parentId || parentId || null,
        isParent: focusArea?.isParent || isParent || false
    });

    const isEditing = !!formData.id;

    function handleClickOpen() {
        setOpen(true);
        setErrors({
            name: false,
            objective: false,
            description: false,
            criteria: false
        });
        if (focusArea) {
            setFormData({
                id: focusArea.id,
                name: focusArea.name,
                objective: focusArea.objective,
                description: focusArea.description,
                criteria: focusArea.criteria || '',
                coachingProgram: coachingProgramId,
                parentId: focusArea.parentId || parentId || null,
                isParent: focusArea.isParent || isParent || false
            });
        } else {
            // For creating new focus areas
            setFormData({
                id: null,
                name: '',
                objective: '',
                description: '',
                criteria: '',
                coachingProgram: coachingProgramId,
                parentId: parentId || null,
                isParent: isParent || false
            });
        }
    }
    
    function handleClose() {
        setOpen(false);
        setFormData({
            id: focusArea?.id || null,
            name: focusArea?.name || '',
            objective: focusArea?.objective || '',
            description: focusArea?.description || '',
            criteria: focusArea?.criteria || '',
            coachingProgram: coachingProgramId,
            parentId: focusArea?.parentId || parentId || null,
            isParent: focusArea?.isParent || isParent || false
        });
    }

    const validateForm = () => {
        const newErrors = {
            name: !formData.name,
            objective: isEditing ? !formData.objective : false,
            description: isEditing ? !formData.description : false,
            criteria: isEditing ? !formData.criteria : false
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(Boolean);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prevState => ({
                ...prevState,
                [name]: false
            }));
        }
    };

    const handleParentToggle = (event) => {
        const isParent = event.target.checked;
        setFormData(prevState => ({
            ...prevState,
            isParent: isParent,
            // If it's a parent, then it cannot have a parent itself
            parentId: isParent ? null : prevState.parentId
        }));
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            
            // When creating a new focus area, set empty default values for objective, description, and criteria
            const submitData = {...formData};
            if (!isEditing) {
                submitData.objective = "Focus area objective will be added later";
                submitData.description = "Focus area description will be added later";
                submitData.criteria = "Focus area criteria will be added later";
            }
            
            const { data } = await axiosInstance.post("/api/programs/focusAreas", submitData);
            showAlert(isEditing ? 'Focus area updated successfully' : 'Focus area created successfully', 'success');
            
            // Close the dialog before calling the callback to prevent UI glitches
            handleClose();
            
            // Call the callback with the updated data
            if (onOperation) {
                await onOperation();
            }
        } catch (error) {
            console.error('Error creating/updating focus area:', error);
            showAlert(error.response?.data || 'Error creating/updating focus area', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoAwesomeObjective = async () => {
        if (!formData.id) {
            showAlert('Please save the focus area first before enhancing', 'error');
            return;
        }
        try {
            setEnhancingObjective(true);
            const { data } = await axiosInstance.post('/api/ai/completion', {
                keyword: 'focus_area_objective',
                id: formData.id,
                currentText: formData.objective
            });
            setFormData(prev => ({ ...prev, objective: data }));
            showAlert('Objective enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing objective:', error);
            showAlert('Error enhancing objective', 'error');
        } finally {
            setEnhancingObjective(false);
        }
    };

    const handleAutoAwesomeDescription = async () => {
        if (!formData.id) {
            showAlert('Please save the focus area first before enhancing', 'error');
            return;
        }
        try {
            setEnhancingDescription(true);
            const { data } = await axiosInstance.post('/api/ai/completion', {
                keyword: 'focus_area_description',
                id: formData.id,
                currentText: formData.description
            });
            setFormData(prev => ({ ...prev, description: data }));
            showAlert('Description enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing description:', error);
            showAlert('Error enhancing description', 'error');
        } finally {
            setEnhancingDescription(false);
        }
    };

    const handleAutoAwesomeCriteria = async () => {
        if (!formData.id) {
            showAlert('Please save the focus area first before enhancing', 'error');
            return;
        }
        try {
            setEnhancingCriteria(true);
            const { data } = await axiosInstance.post('/api/ai/completion', {
                keyword: 'focus_area_criteria',
                id: formData.id,
                currentText: formData.criteria
            });
            setFormData(prev => ({ ...prev, criteria: data }));
            showAlert('Criteria enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing criteria:', error);
            showAlert('Error enhancing criteria', 'error');
        } finally {
            setEnhancingCriteria(false);
        }
    };

    const renderButton = () => {
        if (buttonType === "icon") {
            const isEditing = Boolean(focusArea && focusArea.id);
            const isCreatingSubArea = Boolean(parentId && !focusArea);
            
            if (isEditing) {
                return (
                    <Tooltip title="Edit Focus Area" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <ModernIconButton onClick={handleClickOpen}>
                            <Edit sx={{ fontSize: '18px' }} />
                        </ModernIconButton>
                    </Tooltip>
                );
            } else if (isCreatingSubArea) {
                return (
                    <Tooltip title="Add Sub Area" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <AddButton onClick={handleClickOpen}>
                            <Add sx={{ fontSize: '18px' }} />
                        </AddButton>
                    </Tooltip>
                );
            } else {
                return (
                    <Tooltip title="Add Focus Area" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <AddButton onClick={handleClickOpen}>
                            <Add sx={{ fontSize: '18px' }} />
                        </AddButton>
                    </Tooltip>
                );
            }
        } else if (buttonType === "custom" && customButtonProps) {
            return (
                <Button 
                    onClick={handleClickOpen}
                    {...customButtonProps}
                />
            );
        }
        return (
            <Tooltip title="Add Focus Area" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                <AddButton onClick={handleClickOpen}>
                    <Add sx={{ fontSize: '18px' }} />
                </AddButton>
            </Tooltip>
        );
    };

    const getDialogTitle = () => {
        if (isEditing) {
            return formData.isParent ? 'Edit Parent Focus Area' : 'Edit Sub Area';
        }
        return formData.isParent ? 'Create Parent Focus Area' : 'Create Sub Area';
    };

    const getDialogIcon = () => {
        if (isEditing) {
            return formData.isParent ? <FolderSpecial sx={{ fontSize: '24px', color: colors.primary }} /> : <AccountTree sx={{ fontSize: '24px', color: colors.primary }} />;
        }
        return formData.isParent ? <FolderSpecial sx={{ fontSize: '24px', color: colors.primary }} /> : <AccountTree sx={{ fontSize: '24px', color: colors.primary }} />;
    };

    return (
        <DialogRoot>
            {renderButton()}
            <StyledDialog open={open} onClose={handleClose} maxWidth={isEditing ? "lg" : "sm"} fullWidth>
                <StyledDialogTitle>
                    <TitleContent direction="row" spacing={2} alignItems="center">
                        <TitleIcon>
                            {getDialogIcon()}
                        </TitleIcon>
                        <Box sx={{ flex: 1 }}>
                            <TitleText>
                                {getDialogTitle()}
                            </TitleText>
                            {isEditing && (
                                <StatusChip
                                    icon={formData.isParent ? <FolderSpecial sx={{ fontSize: '14px' }} /> : <AccountTree sx={{ fontSize: '14px' }} />}
                                    label={formData.isParent ? 'Parent Area' : 'Sub Area'}
                                    isparent={formData.isParent}
                                    size="small"
                                    sx={{ marginTop: '8px' }}
                                />
                            )}
                        </Box>
                    </TitleContent>
                </StyledDialogTitle>
                
                <StyledDialogContent>
                    <FormSection>
                        <FieldContainer>
                            <StyledTextField
                                margin="dense"
                                id="name"
                                name="name"
                                label="Focus Area Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={errors.name}
                                helperText={errors.name ? "Name is required" : "Enter a descriptive name for this focus area"}
                                placeholder="e.g., Leadership Development, Communication Skills"
                            />
                        </FieldContainer>
                        
                        {/* Only show the parent toggle when creating a new focus area and parentId is not provided */}
                        {!isEditing && parentId === null && (
                            <SwitchContainer elevation={0}>
                                <SwitchIcon>
                                    <FolderSpecial sx={{ fontSize: '20px', color: colors.primary }} />
                                </SwitchIcon>
                                <SwitchLabel>
                                    This is a parent focus area
                                </SwitchLabel>
                                <StyledSwitch
                                    checked={formData.isParent}
                                    onChange={handleParentToggle}
                                    name="isParent"
                                />
                            </SwitchContainer>
                        )}
                        
                        {isEditing && (
                            <>
                                <FieldContainer>
                                    <StyledTextField
                                        margin="dense"
                                        id="objective"
                                        name="objective"
                                        label="Objective"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        multiline
                                        rows={8}
                                        value={formData.objective}
                                        onChange={handleInputChange}
                                        error={errors.objective}
                                        helperText={errors.objective ? "Objective is required" : "Define the main goal and purpose of this focus area"}
                                        placeholder="Describe what this focus area aims to achieve..."
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                alignItems: 'flex-start',
                                                padding: '16px',
                                            }
                                        }}
                                    />
                                    {formData.id && (
                                        <Tooltip title="Enhance with AI" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                                            <EnhanceButton
                                                loading={enhancingObjective}
                                                onClick={handleAutoAwesomeObjective}
                                            >
                                                {!enhancingObjective && <AutoAwesome sx={{ fontSize: '18px' }} />}
                                            </EnhanceButton>
                                        </Tooltip>
                                    )}
                                </FieldContainer>
                                
                                <FieldContainer>
                                    <StyledTextField
                                        margin="dense"
                                        id="description"
                                        name="description"
                                        label="Description"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        multiline
                                        rows={8}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        error={errors.description}
                                        helperText={errors.description ? "Description is required" : "Provide detailed information about this focus area"}
                                        placeholder="Explain the scope, importance, and key aspects of this focus area..."
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                alignItems: 'flex-start',
                                                padding: '16px',
                                            }
                                        }}
                                    />
                                    {formData.id && (
                                        <Tooltip title="Enhance with AI" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                                            <EnhanceButton
                                                loading={enhancingDescription}
                                                onClick={handleAutoAwesomeDescription}
                                            >
                                                {!enhancingDescription && <AutoAwesome sx={{ fontSize: '18px' }} />}
                                            </EnhanceButton>
                                        </Tooltip>
                                    )}
                                </FieldContainer>
                                
                                <FieldContainer>
                                    <StyledTextField
                                        margin="dense"
                                        id="criteria"
                                        name="criteria"
                                        label="Success Criteria"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        multiline
                                        rows={8}
                                        value={formData.criteria}
                                        onChange={handleInputChange}
                                        error={errors.criteria}
                                        helperText={errors.criteria ? "Success criteria is required" : "Define measurable outcomes and indicators of success"}
                                        placeholder="List specific, measurable criteria that indicate successful completion..."
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                alignItems: 'flex-start',
                                                padding: '16px',
                                            }
                                        }}
                                    />
                                    {formData.id && (
                                        <Tooltip title="Enhance with AI" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                                            <EnhanceButton
                                                loading={enhancingCriteria}
                                                onClick={handleAutoAwesomeCriteria}
                                            >
                                                {!enhancingCriteria && <AutoAwesome sx={{ fontSize: '18px' }} />}
                                            </EnhanceButton>
                                        </Tooltip>
                                    )}
                                </FieldContainer>
                            </>
                        )}
                    </FormSection>
                </StyledDialogContent>
                
                <StyledDialogActions>
                    <CancelButton 
                        variant="outlined" 
                        onClick={handleClose}
                        startIcon={<Close sx={{ fontSize: '16px' }} />}
                    >
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading ? null : <Save sx={{ fontSize: '16px' }} />}
                    >
                        {loading ? 'Processing...' : (isEditing ? 'Update Focus Area' : 'Create Focus Area')}
                    </SubmitButton>
                </StyledDialogActions>
            </StyledDialog>
        </DialogRoot>
    );
};

export default CreateFocusAreaForm;