package com.dementiatracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DementiaTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DementiaTrackerApplication.class, args);
    }
}
