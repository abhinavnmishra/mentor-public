import {
    Box, 
    styled, 
    Card, 
    Tab, 
    Divider, 
    Typography,
    Chip,
    Stack,
    alpha,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress as MuiCircularProgress
} from "@mui/material";
import { Breadcrumb } from "app/components";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {H2, H3, H4, H5, Small} from "../../components/Typography.jsx";
import Avatar from "@mui/material/Avatar";
import {useEffect, useState} from "react";
import {
    blue, 
    green, 
    orange, 
    pink, 
    purple, 
    red, 
    teal, 
    yellow
} from "@mui/material/colors";
import {
    Business,
    CalendarToday,
    Info,
    People,
    Assignment,
    School, 
    TaskSharp,
    EventAvailable,
    Edit,
    CheckCircle
} from "@mui/icons-material";
import MenteeTable from "../components/MenteeTable.jsx";
import ProgramDetails from "../components/ProgramDetails.jsx";
import ProgramActivities from "../components/ProgramActivities.jsx";
import { useParams } from "react-router-dom";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import ProgramTasks from "../components/ProgramTasks.jsx";

// Modern color palette consistent with Milestone.jsx
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

const Container = styled("div")(({ theme }) => ({
    margin: "24px",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "24px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

// Modern gradient header replacing stretched images
const GradientHeader = styled(Box)(({ theme }) => ({
    height: '240px',
    background: `linear-gradient(135deg, 
        ${colors.primary} 0%, 
        ${colors.primaryLight} 50%, 
        ${alpha(colors.primary, 0.8)} 100%)`,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px 16px 0 0',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 30% 20%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%),
                     radial-gradient(circle at 70% 80%, ${alpha('#ffffff', 0.08)} 0%, transparent 50%)`,
    }
}));

const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
    position: 'relative',
    padding: '32px',
    marginTop: '-80px',
    zIndex: 2,
}));

const OrganizationCard = styled(Box)(({ theme }) => ({
    backgroundColor: colors.surface,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.15)',
    }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    fontSize: '0.875rem',
    fontWeight: 600,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textTransform: 'none',
    color: colors.text.secondary,
    minHeight: '48px',
    padding: '12px 24px',
    borderRadius: '12px',
    margin: '0 4px',
    transition: 'all 0.2s ease-in-out',
    '&.Mui-selected': {
        color: colors.primary,
        backgroundColor: alpha(colors.primary, 0.1),
    },
    '&:hover': {
        backgroundColor: alpha(colors.secondary, 0.05),
    }
}));

const StyledTabList = styled(TabList)(({ theme }) => ({
    backgroundColor: alpha(colors.secondary, 0.03),
    borderRadius: '16px',
    padding: '8px',
    border: `1px solid ${colors.border}`,
    minHeight: 'auto',
    '& .MuiTabs-indicator': {
        display: 'none',
    },
    [theme.breakpoints.down(780)]: {
        width: "100%",
        "& .MuiTabs-flexContainer": {
            justifyContent: "space-between",
        },
        marginBottom: 20,
    },
}));

const StyledTabPanel = styled(TabPanel)(() => ({
    padding: 0,
}));

const InfoChip = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 500,
    height: '28px',
    borderRadius: '8px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    '& .MuiChip-icon': {
        fontSize: '16px',
        marginLeft: '8px',
    }
}));

const MetadataBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: alpha(colors.secondary, 0.05),
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex', 
    width: '100%', 
    height: '60vh', 
    justifyContent: 'center', 
    alignItems: 'center',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const colors_avatar = [pink[500], green[500], orange[500], yellow[700], blue[500], purple[500], red[500], teal[500]]

const StyledImage = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '12px',
    backgroundColor: alpha(colors.secondary, 0.05),
    border: `1px solid ${colors.border}`,
    padding: '12px',
}));

function getCharSum(str, max) {
    return ([...str].reduce((sum, char) => sum + char.charCodeAt(0), 0))%max;
}

export default function Program() {
    const { programId } = useParams();
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [value, setValue] = useState("1");
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    
    // Calendly event type selection
    const [eventTypeDialogOpen, setEventTypeDialogOpen] = useState(false);
    const [eventTypes, setEventTypes] = useState([]);
    const [selectedEventType, setSelectedEventType] = useState("");
    const [selectedEventTypeUrl, setSelectedEventTypeUrl] = useState("");
    const [loadingEventTypes, setLoadingEventTypes] = useState(false);
    const [updatingEventType, setUpdatingEventType] = useState(false);

    const fetchProgramDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/programs/${programId}`);
            setProgram(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching program details:', error);
            showAlert('Error fetching program details', 'error');
            setLoading(false);
        }
    };

    // Fetch Calendly event types
    const fetchEventTypes = async () => {
        try {
            setLoadingEventTypes(true);
            const { data } = await axiosInstance.get('/api/events/calendly/eventtypes');
            setEventTypes(data || []);
        } catch (error) {
            console.error('Error fetching Calendly event types:', error);
            showAlert('Failed to load Calendly event types. Please ensure you have connected your Calendly account.', 'error');
        } finally {
            setLoadingEventTypes(false);
        }
    };

    // Update program's Calendly event type
    const updateProgramEventType = async () => {
        try {
            setUpdatingEventType(true);
            await axiosInstance.put(`/api/programs/calendly/${programId}?eventType=${selectedEventType}&eventTypeUrl=${selectedEventTypeUrl}`);
            
            // Update local program state with new event type
            setProgram(prev => ({
                ...prev,
                calendlyEventType: selectedEventType,
                calendlyEventTypeSchedulingUrl: selectedEventTypeUrl
            }));
            
            showAlert('Calendly event type updated successfully!', 'success');
            setEventTypeDialogOpen(false);
        } catch (error) {
            console.error('Error updating Calendly event type:', error);
            showAlert('Failed to update Calendly event type', 'error');
        } finally {
            setUpdatingEventType(false);
        }
    };

    // Handle opening the event type dialog
    const handleOpenEventTypeDialog = () => {
        setSelectedEventType(program.calendlyEventType || "");
        setSelectedEventTypeUrl(program.calendlyEventTypeSchedulingUrl || "");
        fetchEventTypes();
        setEventTypeDialogOpen(true);
    };

    useEffect(() => {
        fetchProgramDetails();
    }, [programId]);

    const handleChange = (e, val) => {
        setValue(val);
    };

    const getTabIcon = (tabValue) => {
        switch(tabValue) {
            case "1": return <Info sx={{ fontSize: '18px' }} />;
            case "2": return <People sx={{ fontSize: '18px' }} />;
            case "3": return <TaskSharp sx={{ fontSize: '18px' }} />;
            case "4": return <Assignment sx={{ fontSize: '18px' }} />;
            default: return null;
        }
    };

    if (loading || !program) {
        return (
            <LoadingContainer>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size="3rem" sx={{ color: colors.primary }} />
                    <Typography 
                        sx={{ 
                            color: colors.text.secondary,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '0.875rem'
                        }}
                    >
                        Loading program details...
                    </Typography>
                </Stack>
            </LoadingContainer>
        );
    }

    return (
        <Container>
            <Box className="breadcrumb">
                <Breadcrumb routeSegments={[{ name: "DASHBOARD", path: "/portal/dashboard" }, { name: "PROGRAM" }]} />
            </Box>

            <Box pt={2} pb={4}>
                <TabContext value={value}>
                    <ModernCard>
                        {/* Modern Gradient Header */}
                        <GradientHeader>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '24px',
                                    right: '24px',
                                    zIndex: 3,
                                }}
                            >
                                <InfoChip 
                                    icon={<School />}
                                    label="Coaching Program"
                                    sx={{
                                        backgroundColor: alpha('#ffffff', 0.2),
                                        color: '#ffffff',
                                        border: `1px solid ${alpha('#ffffff', 0.3)}`,
                                        backdropFilter: 'blur(8px)',
                                    }}
                                />
                            </Box>
                        </GradientHeader>

                        <ContentWrapper>
                            {/* Organization Info Card */}
                            <OrganizationCard>
                                {program.clientOrganisation.logoImageUrl ? (
                                    <StyledImage sx={{ minWidth: '80px', width: '80px', height: '80px' }}>
                                        <img
                                            src={backendBaseUrl + program.clientOrganisation.logoImageUrl}
                                            alt={`${program.clientOrganisation.name} logo`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </StyledImage>
                                ) : (
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            fontSize: '32px',
                                            fontWeight: 600,
                                            bgcolor: colors_avatar[getCharSum(program.clientOrganisation.name, 8)],
                                            color: '#ffffff',
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        }}
                                    >
                                        {program.clientOrganisation.name.charAt(0)}
                                    </Avatar>
                                )}
                                
                                <Box sx={{ flex: 1 }}>
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontWeight: 700,
                                            color: colors.text.primary,
                                            fontSize: '1.5rem',
                                            lineHeight: 1.2,
                                            marginBottom: '8px'
                                        }}
                                    >
                                        {program.title}
                                    </Typography>
                                    
                                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                        <MetadataBox>
                                            <Business sx={{ fontSize: '16px', color: colors.text.secondary }} />
                                            <Typography 
                                                sx={{ 
                                                    fontSize: '0.875rem',
                                                    color: colors.text.primary,
                                                    fontWeight: 500,
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                }}
                                            >
                                                {program.clientOrganisation.name}
                                            </Typography>
                                        </MetadataBox>
                                        
                                        <MetadataBox>
                                            <CalendarToday sx={{ fontSize: '16px', color: colors.text.secondary }} />
                                            <Typography 
                                                sx={{ 
                                                    fontSize: '0.875rem',
                                                    color: colors.text.primary,
                                                    fontWeight: 500,
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                }}
                                            >
                                                Started {new Date(program.startDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </Typography>
                                        </MetadataBox>
                                        
                                        {/* Calendly Event Type Button */}
                                        <Button
                                            variant="outlined"
                                            startIcon={program.calendlyEventType ? <EventAvailable color="success" /> : <Edit />}
                                            onClick={handleOpenEventTypeDialog}
                                            sx={{
                                                borderRadius: '8px',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                borderColor: program.calendlyEventType ? colors.success : colors.border,
                                                color: program.calendlyEventType ? colors.success : colors.text.secondary,
                                                backgroundColor: program.calendlyEventType ? alpha(colors.success, 0.05) : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: program.calendlyEventType ? alpha(colors.success, 0.1) : alpha(colors.primary, 0.05),
                                                    borderColor: program.calendlyEventType ? colors.success : colors.primary,
                                                }
                                            }}
                                        >
                                            {program.calendlyEventType ? 'Calendly Event Type Set' : 'Set Calendly Event Type'}
                                        </Button>
                                    </Stack>
                                </Box>
                            </OrganizationCard>

                            {/* Modern Tab Navigation */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                                <StyledTabList onChange={handleChange}>
                                    <StyledTab 
                                        icon={getTabIcon("1")} 
                                        iconPosition="start"
                                        label="About" 
                                        value="1" 
                                    />
                                    <StyledTab 
                                        icon={getTabIcon("2")} 
                                        iconPosition="start"
                                        label="Mentees" 
                                        value="2" 
                                    />
                                    <StyledTab
                                        icon={getTabIcon("3")}
                                        iconPosition="start"
                                        label="Tasks"
                                        value="3"
                                    />
                                    <StyledTab 
                                        icon={getTabIcon("4")}
                                        iconPosition="start"
                                        label="Activities" 
                                        value="4"
                                    />
                                </StyledTabList>
                            </Box>
                        </ContentWrapper>
                    </ModernCard>

                    {/* Tab Content */}
                    <Box sx={{ maxWidth: '1900px', marginInline: 'auto' }} marginTop={3}>
                        <StyledTabPanel value="1">
                            <ProgramDetails program={program} />
                        </StyledTabPanel>

                        <StyledTabPanel value="2">
                            <MenteeTable program={program} />
                        </StyledTabPanel>

                        <StyledTabPanel value="3">
                            <ProgramTasks program={program} />
                        </StyledTabPanel>

                        <StyledTabPanel value="4">
                            <ProgramActivities program={program} />
                        </StyledTabPanel>
                    </Box>
                </TabContext>
            </Box>
            
            {/* Calendly Event Type Selection Dialog */}
            <Dialog 
                open={eventTypeDialogOpen} 
                onClose={() => setEventTypeDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: '8px',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <EventAvailable sx={{ color: colors.primary }} />
                    Select Calendly Event Type
                </DialogTitle>
                
                <DialogContent>
                    {loadingEventTypes ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                            <MuiCircularProgress size={40} sx={{ color: colors.primary }} />
                        </Box>
                    ) : eventTypes.length === 0 ? (
                        <Box sx={{ padding: '16px 0' }}>
                            <Typography 
                                sx={{ 
                                    color: colors.text.secondary,
                                    textAlign: 'center',
                                    marginBottom: '16px',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                }}
                            >
                                No Calendly event types found. Please make sure you've connected your Calendly account.
                            </Typography>
                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                }}
                                onClick={() => window.open(`${backendBaseUrl}/calendly/authorize?type=user`, '_blank')}
                            >
                                Connect Calendly
                            </Button>
                        </Box>
                    ) : (
                        <FormControl fullWidth sx={{ marginTop: '8px' }}>
                            <InputLabel 
                                id="event-type-select-label"
                                sx={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                            >
                                Event Type
                            </InputLabel>
                            <Select
                                labelId="event-type-select-label"
                                id="event-type-select"
                                value={selectedEventType}
                                onChange={(e) => {
                                    setSelectedEventType(e.target.value);
                                    // Find the matching event type to get the scheduleUrl
                                    if (e.target.value) {
                                        const selectedEvent = eventTypes.find(et => et.uri === e.target.value);
                                        if (selectedEvent) {
                                            setSelectedEventTypeUrl(selectedEvent.scheduleUrl);
                                        }
                                    } else {
                                        setSelectedEventTypeUrl("");
                                    }
                                }}
                                label="Event Type"
                                sx={{ 
                                    borderRadius: '8px',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                }}
                            >
                                <MenuItem value="" sx={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    <em>None (Clear selection)</em>
                                </MenuItem>
                                {eventTypes.map((eventType) => (
                                    <MenuItem 
                                        key={eventType.uri} 
                                        value={eventType.uri}
                                        sx={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography>{eventType.name}</Typography>
                                            <Chip 
                                                label={`${eventType.scheduleUrl}`}
                                                size="small" 
                                                sx={{ 
                                                    backgroundColor: alpha(colors.primary, 0.1),
                                                    color: colors.primary,
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    height: '20px'
                                                }}
                                            />
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    
                    {selectedEventType && eventTypes.length > 0 && (
                        <Box sx={{ 
                            marginTop: '24px', 
                            padding: '16px', 
                            backgroundColor: alpha(colors.success, 0.05),
                            borderRadius: '8px',
                            border: `1px solid ${alpha(colors.success, 0.2)}`
                        }}>
                            <Typography 
                                sx={{ 
                                    fontWeight: 600, 
                                    color: colors.text.primary,
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                }}
                            >
                                <CheckCircle sx={{ fontSize: '18px', color: colors.success }} />
                                Selected Event Type
                            </Typography>
                            <Typography sx={{ 
                                fontSize: '0.875rem', 
                                color: colors.text.secondary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            }}>
                                {selectedEventTypeUrl}
                            </Typography>
                            <Typography sx={{ 
                                fontSize: '0.75rem', 
                                color: colors.text.secondary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                marginTop: '4px'
                            }}>
                                This calendly event will be used for scheduling sessions in this program.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setEventTypeDialogOpen(false)}
                        sx={{ 
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={updateProgramEventType}
                        disabled={loadingEventTypes || updatingEventType || eventTypes.length === 0}
                        sx={{ 
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: colors.primary,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            '&:hover': {
                                backgroundColor: colors.primaryLight,
                            }
                        }}
                        startIcon={updatingEventType && <MuiCircularProgress size={16} sx={{ color: '#fff' }} />}
                    >
                        {updatingEventType ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
