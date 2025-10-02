package org.cortex.backend.agreements.constant;

public enum AgreementStatus {
    DRAFT,      // Agreement version is in draft state and can be edited
    PUBLISHED,  // Agreement version is published and immutable
    RETIRED     // Agreement version is retired and no longer available for acceptance
}
