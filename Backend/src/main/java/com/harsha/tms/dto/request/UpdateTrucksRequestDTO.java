package com.harsha.tms.dto.request;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record UpdateTrucksRequestDTO(
        @NotNull(message = "Truck inventory is required")
        @Valid List<TruckDTO> trucks
) {
    public record TruckDTO(
            String truckType,
            Integer count
    ) {
    }
}
