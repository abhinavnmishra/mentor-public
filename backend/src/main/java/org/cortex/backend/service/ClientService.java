package org.cortex.backend.service;

import io.jsonwebtoken.Claims;
import jakarta.annotation.PostConstruct;
import org.apache.commons.io.IOUtils;
import org.cortex.backend.dto.ClientRequestDTO;
import org.cortex.backend.dto.ClientOrganisationDTO;
import org.cortex.backend.dto.MenteeMetadataDto;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.model.*;
import org.cortex.backend.repository.*;
import org.cortex.backend.security.constant.Role;
import org.cortex.backend.security.model.User;
import org.cortex.backend.security.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class ClientService {

    private static final Logger logger = LoggerFactory.getLogger(ClientService.class);
    
    private String clientOnboard;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ClientOrganisationRepository clientOrganisationRepository;

    @Autowired
    private TrainerOrganisationRepository trainerOrganisationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoachingProgramRepository coachingProgramRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CoachingSessionRepository coachingSessionRepository;

    @Autowired
    private ProgramService programService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private ProgramMilestoneRepository programMilestoneRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Value("classpath:email_templates/client_onboarding.html")
    private Resource clientOnboardingResource;

    @Value("${frontend-base-url}")
    private String frontendBaseUrl;

    @Transactional
    public Client createOrUpdateClientWithSession(ClientRequestDTO requestDTO, Claims claims) {
        logger.info("Entering createOrUpdateClientWithSession for client email: {}", requestDTO.getEmail());
        try {
            User user;
            Client client;
            String trainerOrganisationId = (String) claims.get("organisationId");
            logger.debug("Fetching trainer organisations");
            TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString(trainerOrganisationId)).orElseThrow(() -> new RuntimeException("Trainer Organisation Not Found"));

            if(requestDTO.getId() == null || requestDTO.getId().isEmpty()) {
                Optional<Client> clientOptional = findClientByEmailAndOrganisationId(requestDTO.getEmail(), trainerOrganisationId);
                if (clientOptional.isPresent()){
                    logger.debug("Mapping to existing client");
                    client = clientOptional.get();
                    user = client.getUser();
                } else {
                    logger.debug("Creating new user and client");

                    Optional<Client> checkEmailClient = clientRepository.findByEmailAndProgramId(requestDTO.getEmail(), UUID.fromString(requestDTO.getCoachingProgramId()));
                    if (checkEmailClient.isPresent()) {
                        logger.error("Client with email {} already exists in the program", requestDTO.getEmail());
                        throw new RuntimeException("Client with this email already exists in the program");
                    }

                    user = new User();
                    user.setPassword(UUID.randomUUID().toString());
                    user.setUserName(createUsername(requestDTO.getEmail(), trainerOrganisation.getEmail()));
                    client = new Client();
                }
            } else {
                logger.debug("Updating existing user with ID: {}", requestDTO.getId());
                final UUID userId = UUID.fromString(requestDTO.getId());
                client = clientRepository.findByUser_Id(userId)
                        .orElseThrow(() -> {
                            logger.error("Invalid User Id for client: {}", userId);
                            return new RuntimeException("Invalid User Id");
                        });

                user = client.getUser();
            }

            logger.debug("Fetching client organization with ID: {}", requestDTO.getClientOrganisationId());
            ClientOrganisation clientOrg = clientOrganisationRepository.findById(UUID.fromString(requestDTO.getClientOrganisationId()))
                    .orElseThrow(() -> {
                        logger.error("Client Organisation not found with ID: {}", requestDTO.getClientOrganisationId());
                        return new RuntimeException("Client Organisation not found");
                    });

            logger.debug("Setting user details");
            user.setEmail(requestDTO.getEmail());
            user.setFirstName(requestDTO.getFirstName());
            user.setLastName(requestDTO.getLastName());
            user.setRole(Role.ROLE_CLIENT);
            user.setOrganisationId(trainerOrganisationId);
            user = userRepository.save(user);
            logger.debug("User saved with ID: {}", user.getId());

            logger.debug("Setting client details");
            client.setUser(user);
            client.setFirstName(requestDTO.getFirstName());
            client.setLastName(requestDTO.getLastName());
            client.setEmail(requestDTO.getEmail());
            client.setGender(requestDTO.getGender());
            client.setDesignation(requestDTO.getDesignation());
            client.setClientOrganisation(clientOrg);
            client = clientRepository.save(client);
            logger.debug("Client saved with ID: {}", client.getId());

            if(requestDTO.getId() == null || requestDTO.getId().isEmpty()) {
                logger.debug("Creating new coaching session for program ID: {}", requestDTO.getCoachingProgramId());
                CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(requestDTO.getCoachingProgramId()))
                    .orElseThrow(() -> {
                        logger.error("Coaching Program not found with ID: {}", requestDTO.getCoachingProgramId());
                        return new RuntimeException("Coaching Program not found");
                    });

                CoachingSession session = new CoachingSession();
                session.setClient(client);
                session.setCoachingProgram(program);
                session = coachingSessionRepository.save(session);
                backTrackItemsInNewSession(session);
                logger.debug("Coaching session created for client ID: {}", client.getId());
                
                // Send onboarding email to the client
                sendOnboardingEmailToClient(client, program, trainerOrganisation, claims);
            }

            logger.info("Successfully created/updated client with ID: {}", client.getId());
            return client;
        } catch (Exception e) {
            logger.error("Error in createOrUpdateClientWithSession: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting createOrUpdateClientWithSession");
        }
    }

    public CoachingSession backTrackItemsInNewSession(CoachingSession coachingSession) {

        List<ProgramMilestone> milestones = programMilestoneRepository.findAllByCoachingProgramId(coachingSession.getCoachingProgram().getId());
        for (ProgramMilestone milestone : milestones) {
            programService.createMilestoneTrackerForClient(milestone, coachingSession);
        }

        List<Task> tasks = taskRepository.findAllByCoachingProgramId(coachingSession.getCoachingProgram().getId());
        for (Task task : tasks) {
            taskService.createTaskInstanceForClient(task, coachingSession);
        }

        return coachingSession;
    }

    public String createUsername(String userEmail, String orgEmail) {
        // Extract the part before @ from email1
        String localPart = userEmail.split("@")[0];

        // Extract the domain part (between @ and the first dot) from email2
        String domainPart = orgEmail.split("@")[1].split("\\.")[0];

        for (int i = 0; i < 100; i++) {
            String username = localPart + (i == 0 ? "" : "_x" + String.valueOf(i)) + "@" + domainPart;
            Optional<User> userOptional = userRepository.findByUserName(username);
            if (userOptional.isEmpty()) {
                return username;
            }
        }
        throw new RuntimeException("Error Generating Username");
    }

    public Optional<Client> findClientByEmailAndOrganisationId(String email, String organisationId){
        if (email == null || organisationId == null || email.isEmpty() || organisationId.isEmpty()){
            throw new RuntimeException("Invalid Client Email Or Invalid Organisation Id");
        }

        return clientRepository.findByEmailAndClientOrganisation_TrainerOrganisation_Id(email, UUID.fromString(organisationId));
    }

    @PostConstruct
    public void init() throws IOException {
        logger.info("Entering init - Loading email templates");
        try {
            logger.debug("Reading client onboarding template");
            clientOnboard = IOUtils.toString(clientOnboardingResource.getInputStream(), StandardCharsets.UTF_8);
            logger.info("Successfully loaded client email template");
        } catch (IOException e) {
            logger.error("Failed to initialize email templates: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting init");
        }
    }
    
    public void sendOnboardingEmailToClient(Client client, CoachingProgram program, TrainerOrganisation trainerOrganisation, Claims claims) {
        logger.info("Sending onboarding email to client: {}", client.getEmail());
        try {
            String headerUrl = "";
            String footerUrl = "";
            
            if (trainerOrganisation.getHeaderImageId() != null) {
                headerUrl = "/public/" + trainerOrganisation.getHeaderImageId();
            }
            
            if (trainerOrganisation.getFooterImageId() != null) {
                footerUrl = "/public/" + trainerOrganisation.getFooterImageId();
            }
            
            String emailContent = clientOnboard
                .replaceAll("<<client_username>>", client.getUser().getUserName())
                .replaceAll("<<client_name>>", client.getFirstName() + " " + client.getLastName())
                .replaceAll("<<trainer_organisation>>", trainerOrganisation.getName())
                .replaceAll("<<coach_name>>", program.getTrainer().getFirstName() + " " + program.getTrainer().getLastName())
                .replaceAll("<<program_name>>", program.getTitle())
                .replaceAll("<<reset_password_link>>", frontendBaseUrl + "/session/forgot-password")
                .replaceAll("<<get_started_link>>", frontendBaseUrl);
                
            emailService.sendEmailWithBranding(client.getEmail(), "Welcome to Your Coaching Program", emailContent, claims);
            logger.info("Successfully sent onboarding email to client: {}", client.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send onboarding email to client: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public ClientOrganisation createOrUpdateClientOrganisation(ClientOrganisationDTO dto, String trainerOrganisationId) {
        logger.info("Entering createOrUpdateClientOrganisation for organisation: {}", dto.getName());
        try {
            ClientOrganisation org;

            logger.debug("Fetching trainer organisations");
            TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString(trainerOrganisationId)).orElseThrow(() -> new RuntimeException("Trainer Organisation Not Found"));

            if (dto.getId() == null || dto.getId().isEmpty()) {
                logger.debug("Creating new client organisation");
                org = new ClientOrganisation();
                org.setTrainerOrganisation(trainerOrganisation);
            } else {
                logger.debug("Updating existing organisation with ID: {}", dto.getId());
                org = clientOrganisationRepository.findById(UUID.fromString(dto.getId()))
                    .orElseThrow(() -> {
                        logger.error("Invalid organisation Id: {}", dto.getId());
                        return new RuntimeException("Invalid Id");
                    });
            }

            logger.debug("Setting organisation details");
            org.setName(dto.getName());
            org.setDomain(dto.getDomain());
            org.setSize(dto.getSize());
            org.setEmail(dto.getEmail());
            org.setLogoImageUrl(dto.getLogoImageUrl());
            
            org = clientOrganisationRepository.save(org);
            logger.info("Successfully saved organisation with ID: {}", org.getId());
            return org;
        } catch (Exception e) {
            logger.error("Error in createOrUpdateClientOrganisation: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting createOrUpdateClientOrganisation");
        }
    }

    public List<ClientOrganisation> getAllClientOrganisations(String trainerOrganisationId) {
        logger.info("Entering getAllClientOrganisations for Organisation Id : {}", trainerOrganisationId);
        try {
            logger.debug("Fetching trainer organisations");
            TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString(trainerOrganisationId)).orElseThrow(() -> new RuntimeException("Trainer Organisation Not Found"));

            logger.debug("Fetching all client organisations");
            List<ClientOrganisation> organisations = clientOrganisationRepository.findAllByTrainerOrganisation(trainerOrganisation);
            
            logger.debug("Calculating mentee count for each organisation");
            organisations.forEach(org -> {
                long count = clientRepository.countByClientOrganisation(org);
                org.setMenteeCount(count);
                logger.debug("Organisation {} has {} mentees", org.getId(), count);
            });
            
            logger.info("Successfully retrieved {} organisations", organisations.size());
            return organisations;
        } catch (Exception e) {
            logger.error("Error in getAllClientOrganisations: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getAllClientOrganisations");
        }
    }

    public ClientOrganisation getClientOrganisation(String organisationId) {
        logger.info("Entering getClientOrganisation for ID: {}", organisationId);
        try {
            logger.debug("Fetching organisation with ID: {}", organisationId);
            ClientOrganisation org = clientOrganisationRepository.findById(UUID.fromString(organisationId))
                .orElseThrow(() -> {
                    logger.error("Client Organisation not found with ID: {}", organisationId);
                    return new RuntimeException("Client Organisation not found");
                });
            
            long menteeCount = clientRepository.countByClientOrganisation(org);
            org.setMenteeCount(menteeCount);
            logger.debug("Organisation has {} mentees", menteeCount);
            
            logger.info("Successfully retrieved organisation with ID: {}", org.getId());
            return org;
        } catch (Exception e) {
            logger.error("Error in getClientOrganisation: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getClientOrganisation");
        }
    }

    public List<MenteeMetadataDto> getClientsForTagging(String surveyId){
        CoachingProgram coachingProgram = coachingProgramRepository.findBySurveyId(UUID.fromString(surveyId)).orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
        List<Client> clients = coachingSessionRepository.findDistinctClientsByProgramId(coachingProgram.getId());
        ArrayList<MenteeMetadataDto> response = new ArrayList<>();
        for(Client client : clients){
            MenteeMetadataDto dto = new MenteeMetadataDto();
            dto.setId(client.getId().toString() + "-" + client.getUser().getId().toString());
            dto.setEmail(client.getEmail());
            dto.setName(client.getLastName() + "," + client.getFirstName());
            dto.setKeywords(client.fullName() + " " + client.getEmail() + " " + client.getDesignation());
            response.add(dto);
        }
        return response;
    }

    public String getClientContext(String clientId){
        try {
            Client client = clientRepository.findById(UUID.fromString(clientId)).orElseThrow(() -> new ResourceNotFoundException("Client Not Found"));
            String response = """
                    {
                        "clientId" : "<<ID>>",
                        "clientFullName" : "<<NAME>>",
                        "clientGender" : "<<GENDER>>",
                        "clientDesignation" : "<<DESIGNATION>>",
                        "clientOrganisationName" : "<<ORGANISATION>>",
                        "clientOrganisationDomain" : "<<DOMAIN>>"
                    }
                    """;
            response = response.replaceAll("<<ID>>", client.getId().toString())
                    .replaceAll("<<NAME>>", client.fullName())
                    .replaceAll("<<DESIGNATION>>", client.getDesignation())
                    .replaceAll("<<ORGANISATION>>", client.getClientOrganisation().getName())
                    .replaceAll("<<DOMAIN>>", client.getClientOrganisation().getDomain())
                    .replaceAll("<<GENDER>>", client.getGender());
            return response;
        } catch (Exception e){
            e.printStackTrace();
            return "";
        }
    }

} 