import React, { useState } from 'react';
import {
    Box, 
    Card, 
    CardContent, 
    Divider, 
    IconButton, 
    OutlinedInput, 
    styled, 
    Typography,
    Paper,
    Tooltip,
    Fade,
    Badge,
    MenuItem,
    Select,
    alpha,
    Button
} from "@mui/material";
import {
    Close, 
    Psychology,
    Approval,
    FolderSpecial,
    AccountTree,
    ExpandMore,
    ExpandLess,
    CheckCircleOutline,
    LightbulbOutlined,
    Info
} from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import { H5 } from "../../components/Typography.jsx";

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

// Enhanced styled components with modern design
const ModernFocusAreaCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-2px)',
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: `linear-gradient(90deg, ${colors.primary}, ${colors.success})`,
        zIndex: 1
    }
}));

const ModernActionButton = styled(IconButton)(({ theme }) => ({
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: alpha(colors.secondary, 0.1),
    border: `1px solid ${alpha(colors.secondary, 0.2)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
        backgroundColor: alpha(colors.secondary, 0.15),
    }
}));

const CardHeader = styled(Box)(({ theme }) => ({
    padding: '20px 24px 16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${colors.border}`,
}));

const CardTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
}));

const CardActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: '8px',
}));

const ContentContainer = styled(Box)(({ theme, expanded }) => ({
    transition: 'max-height 0.3s ease, opacity 0.3s ease',
    maxHeight: expanded ? '2000px' : '0px',
    opacity: expanded ? 1 : 0,
    overflow: expanded ? 'visible' : 'hidden',
}));

const ModernFocusAreaChip = styled(Chip)(({ theme }) => ({
    background: `linear-gradient(90deg, ${colors.primary}, ${colors.success})`,
    color: 'white',
    fontWeight: 600,
    fontSize: '0.75rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: '8px',
    height: '28px',
    '& .MuiChip-deleteIcon': {
        color: 'white',
        fontSize: '16px',
        '&:hover': {
            color: alpha('#ffffff', 0.8),
        }
    },
}));

const StyledSelectField = styled(Select)(({ theme }) => ({
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
        }
    },
    '& .MuiInputBase-input': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
    }
}));

const InfoSection = styled(Paper)(({ theme }) => ({
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.03),
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
    marginBottom: '16px',
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 300,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
    },
};

// SelectableFocusAreaCard component with modern design
const SelectableFocusAreaCard = ({ focusArea, onDelete, removeButtonLabel = "Remove" }) => {
    const [expanded, setExpanded] = useState(false);
    
    // Determine if focus area has children (for parent areas)
    const hasChildren = focusArea.children && focusArea.children.length > 0;

    return (
        <ModernFocusAreaCard>
            <CardHeader>
                <CardTitle>
                    <Box sx={{ 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: alpha(colors.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FolderSpecial sx={{ color: colors.primary, fontSize: '18px' }} />
                    </Box>
                    <Badge 
                        badgeContent={hasChildren ? focusArea.children.length : 0}
                        color="primary"
                        invisible={!hasChildren}
                        sx={{ 
                            '.MuiBadge-badge': { 
                                fontSize: '10px', 
                                height: '18px', 
                                minWidth: '18px',
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600
                            } 
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            sx={{
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1rem'
                            }}
                        >
                            {focusArea.name}
                        </Typography>
                    </Badge>
                </CardTitle>
                <CardActions>
                    <Tooltip title={removeButtonLabel} arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <ModernActionButton
                            size="small"
                            onClick={() => onDelete(focusArea.id)}
                            sx={{ 
                                backgroundColor: alpha(colors.error, 0.1),
                                borderColor: alpha(colors.error, 0.2),
                                '&:hover': {
                                    backgroundColor: alpha(colors.error, 0.15),
                                }
                            }}
                        >
                            <Close sx={{ fontSize: '16px', color: colors.error }} />
                        </ModernActionButton>
                    </Tooltip>
                    <Tooltip 
                        title={expanded ? "Hide Details" : "Show Details"} 
                        arrow 
                        TransitionComponent={Fade} 
                        TransitionProps={{ timeout: 600 }}
                    >
                        <ModernActionButton
                            size="small"
                            onClick={() => setExpanded(!expanded)}
                            sx={{ 
                                backgroundColor: alpha(colors.primary, 0.1),
                                borderColor: alpha(colors.primary, 0.2),
                                '&:hover': {
                                    backgroundColor: alpha(colors.primary, 0.15),
                                }
                            }}
                        >
                            {expanded ? 
                                <ExpandLess sx={{ fontSize: '16px', color: colors.primary }} /> : 
                                <ExpandMore sx={{ fontSize: '16px', color: colors.primary }} />
                            }
                        </ModernActionButton>
                    </Tooltip>
                </CardActions>
            </CardHeader>
            
            <ContentContainer expanded={expanded}>
                <CardContent sx={{ padding: '24px' }}>
                    {/* Objective Section */}
                    <Box sx={{ marginBottom: '20px' }}>
                        <SectionLabel>
                            <Psychology sx={{ fontSize: '14px' }} />
                            Objective
                        </SectionLabel>
                        <InfoSection elevation={0}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.5,
                                    color: colors.text.primary
                                }}
                            >
                                {focusArea.objective || "No objective provided"}
                            </Typography>
                        </InfoSection>
                    </Box>

                    {/* Description Section */}
                    <Box sx={{ marginBottom: '20px' }}>
                        <SectionLabel>
                            <Approval sx={{ fontSize: '14px' }} />
                            Description
                        </SectionLabel>
                        <InfoSection elevation={0}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.5,
                                    color: colors.text.primary
                                }}
                            >
                                {focusArea.description || "No description provided"}
                            </Typography>
                        </InfoSection>
                    </Box>

                    {/* Success Criteria Section */}
                    <Box sx={{ marginBottom: hasChildren ? '20px' : '0' }}>
                        <SectionLabel>
                            <CheckCircleOutline sx={{ fontSize: '14px' }} />
                            Success Criteria
                        </SectionLabel>
                        <InfoSection elevation={0}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.5,
                                    color: colors.text.primary
                                }}
                            >
                                {focusArea.criteria || "No success criteria provided"}
                            </Typography>
                        </InfoSection>
                    </Box>

                    {/* Sub Focus Areas Section */}
                    {hasChildren && (
                        <Box>
                            <SectionLabel>
                                <AccountTree sx={{ fontSize: '14px' }} />
                                Sub Focus Areas ({focusArea.children.length})
                            </SectionLabel>
                            <Box sx={{ 
                                padding: '16px',
                                borderRadius: '12px',
                                backgroundColor: alpha(colors.success, 0.03),
                                border: `1px solid ${alpha(colors.success, 0.1)}`,
                            }}>
                                {focusArea.children.map((child, index) => (
                                    <Box 
                                        key={child.id}
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: index % 2 === 0 ? alpha(colors.success, 0.05) : 'transparent',
                                            marginBottom: index < focusArea.children.length - 1 ? '4px' : '0'
                                        }}
                                    >
                                        <LightbulbOutlined sx={{ 
                                            marginRight: '8px', 
                                            color: colors.success, 
                                            fontSize: '16px' 
                                        }} />
                                        <Typography 
                                            variant="body2" 
                                            sx={{
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontSize: '0.875rem',
                                                color: colors.text.primary,
                                                fontWeight: 500
                                            }}
                                        >
                                            {child.name}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </ContentContainer>
        </ModernFocusAreaCard>
    );
};

/**
 * FocusAreaSelector - A reusable component for selecting and displaying focus areas
 * 
 * @param {Object[]} availableFocusAreas - Array of all available focus areas to select from
 * @param {Object[]} selectedFocusAreas - Array of currently selected focus areas
 * @param {Function} onFocusAreasChange - Callback when selected focus areas change
 * @param {string} title - Optional title for the section (default: "Focus Areas")
 * @param {string} description - Optional description text
 * @param {string} emptyStateMessage - Optional message to show when no focus areas are selected
 * @param {string} removeTooltip - Optional tooltip text for the remove button
 */
const FocusAreaSelector = ({
    availableFocusAreas,
    selectedFocusAreas,
    onFocusAreasChange,
    title = "Focus Areas",
    description = "Select focus areas. These represent the skills and competencies addressed.",
    emptyStateMessage = "Select focus areas from the dropdown above.",
    removeTooltip = "Remove"
}) => {
    const theme = useTheme();

    // Get styles for menu items
    const getStyles = (id, focusAreas, theme) => {
        return {
            fontWeight: focusAreas.some(item => item.id === id)
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        };
    };

    // Handle selection change
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        // Convert the selected values to an array if it's not already
        const selectedValues = Array.isArray(value) ? value : [value];

        // Filter out duplicates based on id
        const uniqueSelectedAreas = selectedValues.filter((item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        onFocusAreasChange(uniqueSelectedAreas);
    };

    // Handle removing a focus area
    const handleDeleteFocusArea = (focusAreaId) => {
        const updatedAreas = selectedFocusAreas.filter(area => area.id !== focusAreaId);
        onFocusAreasChange(updatedAreas);
    };

    return (
        <Box sx={{ 
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            {/* Section Header */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '16px',
                marginTop: '24px'
            }}>
                <Box sx={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: alpha(colors.primary, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                }}>
                    <AccountTree sx={{ color: colors.primary, fontSize: '20px' }} />
                </Box>
                <Typography 
                    variant="h6"
                    sx={{
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontWeight: 600,
                        color: colors.text.primary,
                        fontSize: '1.125rem'
                    }}
                >
                    {title}
                </Typography>
            </Box>
            
            {/* Selection Interface */}
            <Paper 
                elevation={0}
                sx={{ 
                    padding: '20px', 
                    marginBottom: '24px', 
                    backgroundColor: alpha(colors.primary, 0.03),
                    borderRadius: '12px',
                    border: `1px solid ${alpha(colors.primary, 0.1)}`,
                }}
            >
                <Typography 
                    variant="body2" 
                    sx={{ 
                        marginBottom: '16px', 
                        display: 'flex', 
                        alignItems: 'center',
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '0.875rem',
                        color: colors.text.secondary,
                        lineHeight: 1.5
                    }}
                >
                    <Info sx={{ marginRight: '8px', color: colors.primary, fontSize: '18px' }} />
                    {description}
                </Typography>
                
                <StyledSelectField
                    id="focus-areas"
                    multiple
                    fullWidth
                    value={selectedFocusAreas}
                    onChange={handleChange}
                    input={<OutlinedInput id="select-multiple-chip" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {selected.map((item) => (
                                <ModernFocusAreaChip 
                                    key={item.id} 
                                    label={item.name}
                                    deleteIcon={<Close />}
                                    onDelete={() => handleDeleteFocusArea(item.id)}
                                />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                    displayEmpty
                    sx={{
                        '& .MuiSelect-select': {
                            minHeight: '48px',
                            display: 'flex',
                            alignItems: 'center',
                        }
                    }}
                >
                    <MenuItem disabled value="">
                        <Typography sx={{ 
                            color: colors.text.disabled,
                            fontStyle: 'italic',
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}>
                            Select focus areas...
                        </Typography>
                    </MenuItem>
                    {availableFocusAreas.map((item) => (
                        <MenuItem
                            key={item.id}
                            value={item}
                            style={getStyles(item.id, selectedFocusAreas, theme)}
                            disabled={selectedFocusAreas.some(selected => selected.id === item.id)}
                            sx={{
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.875rem',
                                '&.Mui-disabled': {
                                    opacity: 0.5
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <FolderSpecial sx={{ 
                                    marginRight: '12px', 
                                    color: colors.primary, 
                                    fontSize: '18px' 
                                }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                    }}>
                                        {item.name}
                                    </Typography>
                                    {item.children && item.children.length > 0 && (
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: colors.text.secondary,
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {item.children.length} sub-area{item.children.length !== 1 ? 's' : ''}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </MenuItem>
                    ))}
                </StyledSelectField>
            </Paper>

            {/* Selected Focus Areas Display */}
            {selectedFocusAreas.length > 0 ? (
                <Box sx={{ marginTop: '16px' }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '16px' 
                    }}>
                        {selectedFocusAreas.map((area) => (
                            <SelectableFocusAreaCard
                                key={area.id}
                                focusArea={area}
                                onDelete={handleDeleteFocusArea}
                                removeButtonLabel={removeTooltip}
                            />
                        ))}
                    </Box>
                </Box>
            ) : (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        padding: '48px 24px', 
                        backgroundColor: alpha(colors.secondary, 0.03),
                        borderRadius: '12px',
                        border: `1px dashed ${alpha(colors.secondary, 0.2)}`,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '16px',
                        marginTop: '16px',
                        marginBottom: '16px'
                    }}
                >
                    <Box sx={{ 
                        padding: '16px', 
                        borderRadius: '50%', 
                        backgroundColor: alpha(colors.secondary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <AccountTree sx={{ fontSize: '32px', color: colors.text.disabled }} />
                    </Box>
                    <Typography 
                        variant="h6" 
                        sx={{
                            color: colors.text.secondary,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontWeight: 600,
                            fontSize: '1rem'
                        }}
                    >
                        No Focus Areas Selected
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            maxWidth: '400px', 
                            margin: '0 auto',
                            color: colors.text.secondary,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '0.875rem',
                            lineHeight: 1.5
                        }}
                    >
                        {emptyStateMessage}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default FocusAreaSelector; 