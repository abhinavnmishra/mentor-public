package org.cortex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.model.Trainer;
import org.cortex.backend.security.model.User;
import org.cortex.backend.security.constant.Role;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TrainerRequestDTO {

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String shortDescription;
    private String longDescription;
    private String trainerOrganisationId;
    private String userRole;

    public Trainer convertToTrainer(){
        Trainer trainer = new Trainer();
        trainer.setFirstName(this.firstName);
        trainer.setLastName(this.lastName);
        trainer.setEmail(this.email);
        trainer.setShortDescription(this.shortDescription);
        trainer.setLongDescription(this.longDescription);
        return trainer;
    }

    public User convertToUser() {
        User user = new User();
        user.setEmail(this.email);
        user.setFirstName(this.firstName);
        user.setLastName(this.lastName);
        user.setRole(Role.valueOf(this.userRole));
        user.setOrganisationId(trainerOrganisationId);
        return user;
    }

}