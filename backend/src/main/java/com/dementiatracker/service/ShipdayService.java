package com.dementiatracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class ShipdayService {

    @Value("${shipday.api.key}")
    private String apiKey;

    @Value("${shipday.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Fetch current GPS location from Shipday API
     * Note: This is a placeholder implementation.
     * You'll need to adjust based on actual Shipday API documentation
     * 
     * @param trackingId Shipday tracking ID or device ID
     * @return Map containing latitude and longitude
     */
    public Map<String, Double> fetchLocation(String trackingId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            // Adjust endpoint based on actual Shipday API
            String endpoint = apiUrl + "/tracking/" + trackingId + "/location";

            ResponseEntity<Map> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.GET,
                    entity,
                    Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();

                // Extract latitude and longitude from response
                // Adjust field names based on actual API response structure
                Double latitude = ((Number) body.get("latitude")).doubleValue();
                Double longitude = ((Number) body.get("longitude")).doubleValue();

                Map<String, Double> location = new HashMap<>();
                location.put("latitude", latitude);
                location.put("longitude", longitude);

                return location;
            }

            throw new RuntimeException("Failed to fetch location from Shipday API");

        } catch (Exception e) {
            throw new RuntimeException("Error fetching location from Shipday: " + e.getMessage(), e);
        }
    }

    /**
     * Verify Shipday API connection
     */
    public boolean testConnection() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl + "/health",
                    HttpMethod.GET,
                    entity,
                    String.class);

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }
}
