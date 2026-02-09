package com.dementiatracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String userId;
    private String username;
    private String role;
    private String patientId; // For patients: their ID, For caretakers: null
}
