# Node-Redis Application

## Overview

This project is a Node.js and Express application that demonstrates the capabilities of Redis as a key-value store and caching solution. It showcases various Redis use cases and how they are integrated into a web application. The main features of this application include:

# Redis Usecases: 
Demonstrates the versatile use of Redis for rate limiting, leaderboard, session storage, geospatial indexing, and API response caching.

1. **Rate Limiting**: Implements a security feature where users who enter an incorrect email and password combination more than 5 times within a 2-minute time frame will be rate-limited and temporarily prevented from making further login attempts.

2. **Leaderboard**: Displays the top 10 users with their scores and provides buttons to increment their scores. The leaderboard is powered by Redis sorted sets, which allow for efficient ranking and scoring of users.

3. **Redis Session Storage**: Users can register, log in, and create a session. Once a session is established, users can log in as their previous user without re-entering their email and password until they decide to log out and destroy the session. Redis is used to store user sessions, ensuring a seamless experience.

4. **Geospatial Indexing**: Users can mark a pin on a map and enter a radius. The application will then display nearby places within the specified radius in a table. This feature utilizes Redis's geospatial indexing capabilities to efficiently retrieve location-based data.

5. **API Response Caching**: Fetching GitHub stars for a repository and caching the response for 30 seconds if the user requests the same repository. This feature optimizes response times and reduces unnecessary API calls to GitHub.

## Technologies Used

- **Node.js**: The server runtime for executing JavaScript on the server side.
- **Express**: A popular web application framework for Node.js.
- **Redis**: An in-memory data store used for various data storage and caching needs.
- **EJS (Embedded JavaScript)**: A template engine for rendering dynamic HTML content.
