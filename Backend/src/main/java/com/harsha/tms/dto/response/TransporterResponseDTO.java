package com.harsha.tms.dto.response;

import java.util.List;
import java.util.UUID;

public record TransporterResponseDTO(
        UUID transporterId,
        String companyName,
        Double rating,
        List<TruckResponseDTO> trucks
) {
    public record TruckResponseDTO(UUID id, String truckType, Integer count) {
    }
}
