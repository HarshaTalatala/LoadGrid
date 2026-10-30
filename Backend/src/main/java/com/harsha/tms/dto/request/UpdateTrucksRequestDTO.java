package com.harsha.tms.dto.request;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateTrucksRequestDTO(
        @NotNull(message = "Truck inventory is required")
        @Valid List<TruckDTO> trucks
) {
    public record TruckDTO(
            @NotBlank(message = "Truck type is required")
            String truckType,

            @NotNull(message = "Truck count is required")
            @Min(value = 0, message = "Truck count cannot be negative")
            Integer count
    ) {
    }
}
