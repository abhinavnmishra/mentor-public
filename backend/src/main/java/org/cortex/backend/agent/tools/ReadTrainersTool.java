package org.cortex.backend.agent.tools;

import io.jsonwebtoken.Claims;
import org.cortex.backend.model.Trainer;
import org.cortex.backend.repository.TrainerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
public class ReadTrainersTool extends AbstractTool{

    public Boolean previewRequired = Boolean.FALSE;

    @Autowired
    private TrainerRepository trainerRepository;

    @Override
    @Bean(name = "read_trainers")
    public Function<Map<String, Object>, String> toolFunction() {

        return stringObjectMap -> {
            Claims claims = (Claims) stringObjectMap.get("claims");
            List<Trainer> trainers = trainerRepository.findByTrainerOrganisation_Id(UUID.fromString(claims.get("organisationId").toString()));
            return createJSONList(trainers.stream().map(Trainer::getContext).collect(Collectors.toList()));
        };
    }
}
