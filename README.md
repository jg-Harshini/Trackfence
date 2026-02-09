# Dementia Patient Tracking System

A comprehensive web application for tracking dementia patients using GPS technology with real-time location monitoring, geofencing alerts, and role-based access control.

## Features

### For Patients
- **Shareable Patient ID**: Generate and share a unique ID with caretakers
- **Location Tracking**: Automatic GPS location updates
- **Profile Management**: View and update personal information
- **Location History**: View past location data

### For Caretakers
- **Real-time Map View**: Track patient locations on Google Maps
- **Safe Zone Management**: Create circular geofences by clicking on the map
- **Automatic Alerts**: Receive instant notifications when patients exit safe zones
- **Multiple Patient Support**: Link and monitor multiple patients
- **Alert Dashboard**: View and acknowledge geofencing alerts

### Technical Features
- **Role-Based Authentication**: Separate dashboards for patients and caretakers
- **Real-time Updates**: WebSocket integration for live location and alert updates
- **Geofencing**: Haversine formula for accurate distance calculations
- **Shipday API Integration**: Fetch GPS coordinates from Shipday tracking system
- **MongoDB Atlas**: Cloud database for scalable data storage

## Technology Stack

### Backend
- Java Spring Boot 3.2.2
- MongoDB Atlas
- Spring Security with JWT
- WebSocket (STOMP)
- Shipday API

### Frontend
- React 18
- Material-UI (MUI)
- Google Maps API
- Axios
- WebSocket (SockJS + STOMP)

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- MongoDB Atlas account
- Google Maps API key
- Shipday API key (optional)

## Setup Instructions

### 1. MongoDB Atlas Configuration

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string (should look like: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/`)

### 2. Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain (optional but recommended)

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd dementia-tracker/backend
```

2. Configure `src/main/resources/application.properties`:
```properties
# MongoDB Atlas - Replace with your connection string
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
spring.data.mongodb.database=dementia_tracker

# JWT Secret - Change to a secure random string
jwt.secret=YOUR_SECURE_SECRET_KEY_HERE_AT_LEAST_256_BITS

# Shipday API (if using)
shipday.api.key=YOUR_SHIPDAY_API_KEY
shipday.api.url=https://api.shipday.com
```

3. Build and run the backend:
```bash
# Using Maven Wrapper (Windows)
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# Using Maven Wrapper (Mac/Linux)
./mvnw clean install
./mvnw spring-boot:run

# Or using installed Maven
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd dementia-tracker/frontend
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Edit `.env` and add your Google Maps API key:
```
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
VITE_API_URL=http://localhost:8080
```

4. Install dependencies:
```bash
npm install
```

5. Run the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage Guide

### Patient Workflow

1. **Register**: Create an account with role "Patient"
2. **Login**: Access the patient dashboard
3. **Share ID**: Copy your shareable Patient ID from the dashboard
4. **Send ID**: Share this ID with your caretakers
5. **Location Tracking**: Your location will be automatically tracked

### Caretaker Workflow

1. **Register**: Create an account with role "Caretaker"
2. **Login**: Access the caretaker dashboard
3. **Link Patient**: Click "Link Patient" and enter the patient's shareable ID
4. **View Map**: See patient location on Google Maps in real-time
5. **Create Safe Zones**: Click anywhere on the map to create a safe zone
   - Enter zone name (e.g., "Home", "Park")
   - Set radius in meters
   - Click "Create"
6. **Monitor Alerts**: Receive automatic notifications when patients exit safe zones
7. **Acknowledge Alerts**: Click the notification icon to view and acknowledge alerts

## Geofencing Implementation

The system uses the **Haversine formula** to calculate distances between GPS coordinates:

```java
distance = 2 * R * arcsin(sqrt(
    sin²((lat2 - lat1) / 2) + 
    cos(lat1) * cos(lat2) * sin²((lon2 - lon1) / 2)
))
```

Where:
- R = Earth's radius (6,371 km)
- lat1, lon1 = Patient's current location
- lat2, lon2 = Safe zone center

**Alert Triggering**: When `distance > zone.radius`, an alert is automatically created and sent via WebSocket to all linked caretakers.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Locations
- `POST /api/locations` - Update patient location
- `POST /api/locations/shipday` - Update from Shipday API
- `GET /api/locations/patient/{id}/current` - Get current location
- `GET /api/locations/patient/{id}/history` - Get location history

### Safe Zones
- `POST /api/safezones` - Create safe zone (Caretaker only)
- `GET /api/safezones/patient/{id}` - Get patient safe zones
- `PUT /api/safezones/{id}` - Update safe zone
- `DELETE /api/safezones/{id}` - Delete safe zone

### Alerts
- `GET /api/alerts/patient/{id}` - Get all alerts
- `GET /api/alerts/patient/{id}/unacknowledged` - Get unacknowledged alerts
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert

### Users
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user profile
- `POST /api/users/link` - Link caretaker to patient

## WebSocket Topics

- `/topic/location/{patientId}` - Real-time location updates
- `/topic/alerts/{patientId}` - Real-time alert notifications

## Project Structure

```
dementia-tracker/
├── backend/
│   ├── src/main/java/com/dementiatracker/
│   │   ├── config/          # Security & WebSocket config
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── model/           # Entity models
│   │   ├── repository/      # MongoDB repositories
│   │   ├── security/        # JWT utilities
│   │   └── service/         # Business logic
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── context/         # React context (Auth)
    │   ├── services/        # API services
    │   └── App.jsx
    └── package.json
```

## Security Notes

1. **Change JWT Secret**: Use a strong, random secret key in production
2. **HTTPS**: Always use HTTPS in production
3. **API Key Restrictions**: Restrict Google Maps API key to your domain
4. **MongoDB Security**: Use strong passwords and IP whitelisting
5. **CORS**: Configure CORS to only allow your frontend domain

## Troubleshooting

### Backend won't start
- Check MongoDB connection string is correct
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify Java 17+ is installed: `java -version`

### Frontend can't connect to backend
- Verify backend is running on port 8080
- Check CORS configuration in `SecurityConfig.java`
- Ensure `.env` file has correct API URL

### Google Maps not loading
- Verify Google Maps API key in `.env`
- Check browser console for API errors
- Ensure Maps JavaScript API is enabled in Google Cloud Console

### WebSocket connection fails
- Check firewall settings
- Verify WebSocket endpoint is accessible
- Check browser console for connection errors

## Future Enhancements

- Email/SMS notifications for alerts
- Battery level monitoring
- Movement detection (no movement alerts)
- Historical route playback
- Mobile app (React Native)
- Multi-language support

## License

This project is for educational and personal use.

## Support

For issues or questions, please create an issue in the repository.
