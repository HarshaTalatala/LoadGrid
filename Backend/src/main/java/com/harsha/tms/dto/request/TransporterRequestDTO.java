package com.harsha.tms.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TransporterRequestDTO(
        @NotBlank(message = "Company name is required")
        String companyName,

        @NotNull(message = "Rating is required")
        @DecimalMin(value = "0.0", message = "Rating must be at least 0.0")
        @DecimalMax(value = "5.0", message = "Rating must be at most 5.0")
        Double rating
) {
}
