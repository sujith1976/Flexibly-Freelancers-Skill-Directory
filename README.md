# Fullstack Application with Next.js, Node.js, and MongoDB

This is a fullstack application boilerplate using Next.js for the frontend, Node.js/Express for the backend, and MongoDB for the database.

## Project Structure

```
fullstack-app/
├── client/              # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js App Router
│   │   └── ...
│   ├── package.json
│   └── ...
└── server/              # Node.js/Express backend
    ├── src/
    │   ├── config/      # Configuration files
    │   ├── controllers/ # Route controllers
    │   ├── models/      # Mongoose models
    │   ├── routes/      # Express routes
    │   └── index.ts     # Entry point
    ├── package.json
    └── ...
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local installation or MongoDB Atlas account)

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fullstack-app
   ```

4. Run the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

- `GET /api/items`: Get all items
- `GET /api/items/:id`: Get a specific item
- `POST /api/items`: Create a new item
- `PUT /api/items/:id`: Update an item
- `DELETE /api/items/:id`: Delete an item 