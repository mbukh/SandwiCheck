[![Deploy Build to Pages](https://github.com/mbukh/SandwiCheck/actions/workflows/deploy-to-pages.yml/badge.svg)](https://github.com/mbukh/SandwiCheck/actions/workflows/deploy-to-pages.yml)

# SandwiCheck Deployment Guide

SandwiCheck is a full-stack MERN family meal planner with features such as:

- Visual sandwich builder
- User management
- Dietary preferences

## Demo: [SandwiCheck](http://mbukh.github.io/SandwiCheck/)

## Pre-Deployment Steps

1. **Install MongoDB**

   - For detailed installation instructions, visit the [MongoDB Getting Started Guide](https://docs.mongodb.com/manual/installation/).

2. **Use Existing Ingredients** [*optionally*]
   If you intend to use existing ingredients, follow these steps:

   - **Install Node.js (18.x or higher)**

     - Detailed installation instructions can be found on the [Node.js website](https://nodejs.org/en/download/package-manager/).

   - **Initialize the Database Locally**  
     Navigate to the project directory and run:
     ```bash
     node ./server/service/initDatabase.js
     ```

## Deployment Steps

1. **Install Docker**

   - For detailed installation instructions, visit the [Docker website](https://www.docker.com/get-started).

2. **Set Environment Parameters**  
   Ensure you have all the necessary environment variables and configurations set up.

3. **Run the Application**  
   Execute the following command: `docker compose up`

4. **Access the Application**  
   Once everything is up and running, navigate to [http://localhost:5000](http://localhost:5000) in a browser.

Happy meal planning!
