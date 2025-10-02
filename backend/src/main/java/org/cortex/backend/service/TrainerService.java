package org.cortex.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import org.apache.commons.io.IOUtils;
import org.cortex.backend.dto.TrainerRequestDTO;
import org.cortex.backend.dto.TrainerResponseDTO;
import org.cortex.backend.dto.TrainerUpdateDTO;
import org.cortex.backend.dto.TrainerOrganisationDTO;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.llm.Image.ImageAnalysis;
import org.cortex.backend.model.Trainer;
import org.cortex.backend.model.TrainerOrganisation;
import org.cortex.backend.repository.TrainerOrganisationRepository;
import org.cortex.backend.repository.TrainerRepository;
import org.cortex.backend.repository.CoachingProgramRepository;
import org.cortex.backend.repository.CoachingSessionRepository;
import org.cortex.backend.security.constant.Role;
import org.cortex.backend.security.model.User;
import org.cortex.backend.security.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainerService {

    private static final Logger logger = LoggerFactory.getLogger(TrainerService.class);

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private TrainerOrganisationRepository trainerOrganisationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoachingProgramRepository coachingProgramRepository;

    @Autowired
    private CoachingSessionRepository coachingSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ImageAnalysis imageAnalysis;

    @Value("classpath:email_templates/trainer_onboarding.html")
    private Resource trainerOnboardingResource;

    @Value("${frontend-base-url}")
    private String frontendBaseUrl;

    @Value("${app.base-url}")
    private String backendBaseUrl;

    ObjectMapper mapper = new ObjectMapper();

    private String trainerOnboard;

    @PostConstruct
    public void init() throws IOException {
        logger.info("Entering init - Loading email templates");
        try {
            logger.debug("Reading peer reminder template");
            trainerOnboard = IOUtils.toString(trainerOnboardingResource.getInputStream(), StandardCharsets.UTF_8);
            logger.info("Successfully loaded all email templates");
        } catch (IOException e) {
            logger.error("Failed to initialize email templates: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting init");
        }
    }

    @Transactional
    public Trainer createOrUpdateTrainer(TrainerRequestDTO trainerRequestDTO, Claims claims) {
        logger.info("Entering createOrUpdateTrainer for trainer email: {}", trainerRequestDTO.getEmail());
        try {
            String trainerOrganisationId = (String) claims.get("organisationId");
            logger.debug("Fetching trainer organisations");
            TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString(trainerOrganisationId)).orElseThrow(() -> new RuntimeException("Trainer Organisation Not Found"));

            logger.debug("Converting DTO to User and Trainer objects");
            User user;
            Trainer trainer;
            boolean sendOnboarding = false;

            if(trainerRequestDTO.getId() == null || trainerRequestDTO.getId().isEmpty()) {
                logger.debug("Creating new user");
                Optional<User> userOptional = userRepository.findByUserName(trainerRequestDTO.getEmail());
                if (userOptional.isPresent()) throw new RuntimeException("Email Already In Use");
                sendOnboarding = true;
                user = new User();
                trainer = new Trainer();
                user.setPassword(UUID.randomUUID().toString());
                user.setUserName(trainerRequestDTO.getEmail());
                user.setOrganisationId(trainerOrganisationId);
            } else {
                logger.debug("Updating existing user with ID: {}", trainerRequestDTO.getId());
                final UUID userId = UUID.fromString(trainerRequestDTO.getId());
                Optional<User> userOptional = userRepository.findById(userId);
                if (userOptional.isEmpty()) throw new RuntimeException("Invalid User Id");
                user = userOptional.get();

                trainer = trainerRepository.findByUser_Id(userId)
                    .orElseThrow(() -> {
                        logger.error("Invalid User ID: {}", userId);
                        return new RuntimeException("Invalid User");
                    });

            }

            user.setEmail(trainerRequestDTO.getEmail());
            user.setFirstName(trainerRequestDTO.getFirstName());
            user.setLastName(trainerRequestDTO.getLastName());
            user.setRole(Role.valueOf(trainerRequestDTO.getUserRole()));
            user = userRepository.save(user);

            trainer.setFirstName(trainerRequestDTO.getFirstName());
            trainer.setLastName(trainerRequestDTO.getLastName());
            trainer.setEmail(trainerRequestDTO.getEmail());
            trainer.setUser(user);
            trainer.setShortDescription(trainerRequestDTO.getShortDescription());
            trainer.setLongDescription(trainerRequestDTO.getLongDescription());
            trainer.setTrainerOrganisation(trainerOrganisation);
            trainer = trainerRepository.save(trainer);

            if (sendOnboarding) {
                emailService.sendEmailWithBranding(trainer.getEmail(), "Onboard To Your New Trainer Account",
                        trainerOnboard.replaceAll("<<trainer_username>>", trainer.getUser().getEmail())
                                .replaceAll("<<trainer_organisation>>", trainerOrganisation.getName())
                                .replaceAll("<<trainer_name>>", trainer.getFirstName() + " " + trainer.getLastName())
                                .replaceAll("<<reset_password_link>>", frontendBaseUrl + "/session/forgot-password")
                                .replaceAll("<<get_started_link>>", frontendBaseUrl + "/docs"), claims);
            }
            logger.info("Successfully created/updated trainer with ID: {}", trainer.getId());
            return trainer;
        } catch (Exception e) {
            logger.error("Error in createOrUpdateTrainer: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        } finally {
            logger.info("Exiting createOrUpdateTrainer");
        }
    }

    public TrainerResponseDTO getTrainerResponseDto(Trainer trainer) {
        logger.info("Entering getTrainerResponseDto for trainer ID: {}", trainer.getId());
        try {
            logger.debug("Creating response DTO");
            TrainerResponseDTO dto = new TrainerResponseDTO();

            dto.setId(trainer.getId());
            dto.setUserName(trainer.getUser().getUserName());
            dto.setFirstName(trainer.getFirstName());
            dto.setLastName(trainer.getLastName());
            dto.setEmail(trainer.getEmail());
            dto.setShortDescription(trainer.getShortDescription());
            dto.setLongDescription(trainer.getLongDescription());
            dto.setTrainerOrganisationId(trainer.getTrainerOrganisation().getId());
            dto.setUserId(trainer.getUser().getId());
            dto.setProfileImageUrl(trainer.getProfileImageUrl());
            dto.setSignatureImageId(trainer.getSignatureImageId());
            dto.setUserRole(trainer.getUser().getRole().toString());

            logger.debug("Calculating program count for trainer");
            int programCount = coachingProgramRepository.countByTrainer_Id(trainer.getId());
            dto.setProgramCount(programCount);

            logger.debug("Calculating unique client count for trainer");
            int clientCount = coachingSessionRepository.countDistinctClientByCoachingProgram_Trainer_Id(trainer.getId());
            dto.setClientCount(clientCount);

            logger.debug("Trainer has {} programs and {} clients", programCount, clientCount);
            return dto;
        } catch (Exception e) {
            logger.error("Error in getTrainerResponseDto: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getTrainerResponseDto");
        }
    }

    @Transactional
    public TrainerResponseDTO setTrainerProfile(TrainerUpdateDTO trainerRequestDTO, String userId) {
        logger.info("Entering setTrainerProfile for user ID: {}", userId);
        try {
            logger.debug("Fetching trainer for user ID: {}", userId);
            Trainer trainer = trainerRepository.findByUser_Id(UUID.fromString(userId))
                .orElseThrow(() -> {
                    logger.error("Trainer not found for user ID: {}", userId);
                    return new ResourceNotFoundException("Trainer Does Not Exist");
                });

            User user = trainer.getUser();

            logger.debug("Updating trainer and user details");
            trainer.setSignature(trainerRequestDTO.getSignature());
            trainer.setSignatureImageId(trainerRequestDTO.getSignatureImageId());
            trainer.setShortDescription(trainerRequestDTO.getShortDescription());
            trainer.setLongDescription(trainerRequestDTO.getLongDescription());
            trainer.setFirstName(trainerRequestDTO.getFirstName());
            trainer.setProfileImageUrl(trainerRequestDTO.getProfileImageUrl());
            trainer.setLocation(trainerRequestDTO.getLocation());
            trainer.setLinkedinUrl(trainerRequestDTO.getLinkedinUrl());
            user.setProfileImageUrl(trainerRequestDTO.getProfileImageUrl());
            user.setFirstName(trainerRequestDTO.getFirstName());
            trainer.setLastName(trainerRequestDTO.getLastName());
            user.setLastName(trainerRequestDTO.getLastName());
            trainer.setEmail(trainerRequestDTO.getEmail());
            user.setEmail(trainerRequestDTO.getEmail());
            user.setTimezone(trainerRequestDTO.getTimeZone());

            user = userRepository.save(user);
            trainer.setUser(user);

            trainer = trainerRepository.save(trainer);
            logger.debug("Trainer profile updated successfully");

            return getTrainerProfile(userId);
        } catch (Exception e) {
            logger.error("Error in setTrainerProfile: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting setTrainerProfile");
        }
    }

    public TrainerResponseDTO getTrainerProfile(String userId) {
        logger.info("Entering getTrainerProfile for user ID: {}", userId);
        try {
            logger.debug("Fetching trainer for user ID: {}", userId);
            Trainer trainer = trainerRepository.findByUser_Id(UUID.fromString(userId))
                .orElseThrow(() -> {
                    logger.error("Trainer not found for user ID: {}", userId);
                    return new ResourceNotFoundException("Trainer Does Not Exist");
                });

            logger.debug("Creating response DTO");
            TrainerResponseDTO dto = new TrainerResponseDTO();

            dto.setId(trainer.getId());
            dto.setFirstName(trainer.getFirstName());
            dto.setLastName(trainer.getLastName());
            dto.setEmail(trainer.getEmail());
            dto.setShortDescription(trainer.getShortDescription());
            dto.setLongDescription(trainer.getLongDescription());
            dto.setTrainerOrganisationId(trainer.getTrainerOrganisation().getId());
            dto.setUserId(trainer.getUser().getId());
            dto.setSignature(trainer.getSignature());
            dto.setSignatureImageId(trainer.getSignatureImageId());
            dto.setProfileImageUrl(trainer.getProfileImageUrl());
            dto.setLinkedinUrl(trainer.getLinkedinUrl());
            dto.setLocation(trainer.getLocation());
            dto.setTimeZone(trainer.getUser().getTimezone());

            logger.debug("Trainer profile retrieved successfully");
            return dto;
        } catch (Exception e) {
            logger.error("Error in getTrainerProfile: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getTrainerProfile");
        }
    }

    public List<TrainerResponseDTO> getTrainersByOrganisation(String organisationId) {
        logger.info("Entering getTrainersByOrganisation for organisation ID: {}", organisationId);
        try {
            logger.debug("Fetching trainers for organisation");
            List<Trainer> trainers = trainerRepository.findByTrainerOrganisation_Id(UUID.fromString(organisationId));
            
            logger.debug("Converting {} trainers to response DTOs", trainers.size());
            List<TrainerResponseDTO> response = trainers.stream()
                .map(this::getTrainerResponseDto)
                .collect(Collectors.toList());

            logger.info("Successfully retrieved {} trainers", response.size());
            return response;
        } catch (Exception e) {
            logger.error("Error in getTrainersByOrganisation: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getTrainersByOrganisation");
        }
    }

    @Transactional
    public TrainerOrganisation createTrainerOrganisation(TrainerOrganisationDTO dto) {
        logger.info("Entering createTrainerOrganisation for organisation: {}", dto.getName());
        try {
            logger.debug("Creating new trainer organisation");
            TrainerOrganisation org = new TrainerOrganisation();
            org.setName(dto.getName());
            org.setEmail(dto.getEmail());
            org.setWebsite(dto.getWebsite());
            org.setAbout(dto.getAbout());
            
            org = trainerOrganisationRepository.save(org);
            logger.info("Successfully created trainer organisation with ID: {}", org.getId());
            return org;
        } catch (Exception e) {
            logger.error("Error in createTrainerOrganisation: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting createTrainerOrganisation");
        }
    }

    public List<TrainerOrganisation> getAllTrainerOrganisations() {
        logger.info("Entering getAllTrainerOrganisations");
        try {
            List<TrainerOrganisation> orgs = trainerOrganisationRepository.findAll();
            logger.info("Successfully retrieved {} trainer organisations", orgs.size());
            return orgs;
        } catch (Exception e) {
            logger.error("Error in getAllTrainerOrganisations: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getAllTrainerOrganisations");
        }
    }

    public TrainerOrganisation getTrainerOrganisationProfile(String organisationId) {
        logger.info("Entering getTrainerOrganisationProfile for ID: {}", organisationId);
        try {
            logger.debug("Fetching trainer organisation");
            TrainerOrganisation org = trainerOrganisationRepository.findById(UUID.fromString(organisationId))
                .orElseThrow(() -> {
                    logger.error("Trainer Organisation not found with ID: {}", organisationId);
                    return new RuntimeException("Trainer Organisation not found");
                });
            
            logger.info("Successfully retrieved trainer organisation");
            return org;
        } catch (Exception e) {
            logger.error("Error in getTrainerOrganisationProfile: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getTrainerOrganisationProfile");
        }
    }

    @Transactional
    public TrainerOrganisation updateTrainerOrganisationProfile(String organisationId, TrainerOrganisationDTO dto) {
        logger.info("Entering updateTrainerOrganisationProfile for ID: {}", organisationId);
        try {
            logger.debug("Fetching trainer organisation");
            TrainerOrganisation org = trainerOrganisationRepository.findById(UUID.fromString(organisationId))
                .orElseThrow(() -> {
                    logger.error("Trainer Organisation not found with ID: {}", organisationId);
                    return new RuntimeException("Trainer Organisation not found");
                });

            ImageAnalysis.ImageAnalysisResponse logoImageDescription = dto.getLogoImageDescription();
            try {
                if (logoImageDescription == null && org.getLogoImageDescription() == null && dto.getLogoImageUrl() != null && !dto.getLogoImageUrl().isEmpty()) {
                    logoImageDescription = imageAnalysis.analyzeImageById(UUID.fromString(dto.getLogoImageUrl().replaceAll("/public/", "")));
                }
                else if (logoImageDescription == null && dto.getLogoImageUrl() != null && !dto.getLogoImageUrl().isEmpty() && !dto.getLogoImageUrl().equalsIgnoreCase(org.getLogoImageUrl())) {
                    logoImageDescription = imageAnalysis.analyzeImageById(UUID.fromString(dto.getLogoImageUrl().replaceAll("/public/", "")));
                }
                else if (logoImageDescription == null && dto.getLogoImageUrl() != null && !dto.getLogoImageUrl().isEmpty() && dto.getLogoImageUrl().equalsIgnoreCase(org.getLogoImageUrl())) {
                    logoImageDescription = org.getLogoImageDescription();
                }

            } catch (Exception e) {
                logger.error("Failed to analyse logo Image");
            }
            
            logger.debug("Updating organisation details");
            org.setName(dto.getName());
            org.setEmail(dto.getEmail());
            org.setWebsite(dto.getWebsite());
            org.setAbout(dto.getAbout());
            org.setHeader(dto.getHeader());
            org.setHeaderImageId(dto.getHeaderImageId());
            org.setFooter(dto.getFooter());
            org.setFooterImageId(dto.getFooterImageId());
            org.setLogoImageUrl(dto.getLogoImageUrl());
            org.setLogoImageDescription(logoImageDescription);
            org.setPrimaryBrandColor(dto.getPrimaryBrandColor());
            org.setSecondaryBrandColor(dto.getSecondaryBrandColor());
            
            org = trainerOrganisationRepository.save(org);
            logger.info("Successfully updated trainer organisation");
            return org;
        } catch (Exception e) {
            logger.error("Error in updateTrainerOrganisationProfile: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting updateTrainerOrganisationProfile");
        }
    }

    public String generateSignature(String userId) {
        logger.info("Entering generateSignature for user ID: {}", userId);
        try {
            logger.debug("Fetching trainer for user ID: {}", userId);
            Trainer trainer = trainerRepository.findByUser_Id(UUID.fromString(userId))
                .orElseThrow(() -> {
                    logger.error("Trainer not found for user ID: {}", userId);
                    return new ResourceNotFoundException("Trainer Does Not Exist");
                });

            return trainer.generateSignature(backendBaseUrl);
        } catch (Exception e) {
            logger.error("Error in generateSignature: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting generateSignature");
        }
    }
}
