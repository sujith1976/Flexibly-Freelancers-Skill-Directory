# Troubleshooting Guide

## Connection Issues

If you're seeing "Failed to fetch" or connection errors, follow these steps:

### 1. Make sure the server is running

```bash
# Navigate to the server directory
cd server

# Start the development server
npm run dev
```

You should see output indicating the server is running on port 5001 and connected to MongoDB.

### 2. Check MongoDB connection

Make sure MongoDB is running and accessible. The server attempts to connect to:
`mongodb://127.0.0.1:27017/fullstack-app`

If you don't have MongoDB installed:
- Install MongoDB locally, or
- Use MongoDB Atlas (cloud) and update the connection string in `server/src/config/env.ts`

### 3. Check for CORS issues

The application is configured to allow CORS (Cross-Origin Resource Sharing). If you're experiencing CORS errors:

- Make sure your server is actually running
- The port numbers match (client expects server on port 5001)
- The server CORS middleware is configured correctly

### 4. Check for network or firewall issues

- Make sure port 5001 is not blocked by your firewall
- Try a different port by modifying the PORT in `server/src/config/env.ts`

## MongoDB Connection Errors

If you see "MongoDB connection error", make sure:

1. MongoDB is installed and running
2. The connection string is correct
3. No authentication is required (or credentials are provided)
4. The port isn't blocked by a firewall

## Checking API Endpoints Directly

You can test the API directly with curl:

```bash
# Test the API endpoints
curl http://localhost:5001/api/freelancers
```

## Still Having Issues?

If you've tried all the steps above and are still encountering problems:

1. Check the server logs for detailed error messages
2. Try different network conditions (disable VPN, try a different network)
3. Clear your browser cache and try again 