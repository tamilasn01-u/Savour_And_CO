# Savor & Co.

Savor & Co. is a  website where customers can explore chefs and menus, learn about the catering process, and find booking information. It also includes customer accounts and an admin area for managing menu items and events.

## Features

- Browse chefs, menus, testimonials, and booking information
- Create an account and log in
- Manage menu items and event packages through the admin panel
- Contact the catering team through WhatsApp

## Tech Stack

- React, React Router, and Vite
- Node.js and Express
- MongoDB and Mongoose
- JWT authentication and bcryptjs

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB running locally, or a MongoDB Atlas connection string

### Install Dependencies

From the project root, install the frontend dependencies:

    npm install

Then install the backend dependencies:

    cd backend
    npm install

### Configure the Backend

Create a `backend/.env` file:

    MONGODB_URI=mongodb://localhost:27017/savor-co
    JWT_SECRET=replace-with-a-long-random-secret
    PORT=5000

For MongoDB Atlas, use your Atlas connection string for `MONGODB_URI`. Keep your `.env` file private.

### Run the App

Start the backend from the `backend` directory:

    npm run dev

Start the frontend from the project root in a second terminal:

    npm run dev

Open the local address shown by Vite, usually `http://localhost:****`.

The API runs at `http://localhost:****`. Check `http://localhost:****/api/health` to see whether it is running.

## API Routes

- `POST /api/auth/register` — register a customer account
- `POST /api/auth/login` — log in as a customer
- `POST /api/admin-auth/login` — log in as an admin
- `/api/admin` — admin item and event management
- `GET /api/health` — check API status

## Create an Admin Account

From the `backend` directory, run:

    node seed.js

Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `backend/.env` to choose the admin credentials. Running the seed script replaces an existing admin with the same email.

## Project Structure

    src/       React pages and components
    backend/   Express API, MongoDB models, routes, and middleware
