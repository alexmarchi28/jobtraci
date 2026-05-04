# Job Tracker

Job Tracker is a small full stack application for managing and tracking job applications.

The idea behind the project is to have a single place where I can save interesting job offers, track the status of each application, and keep useful information such as salary range, contract type, recruiter contact, job post link, and personal notes.

I built this project to learn how to create full stack applications and to become more confident with C#, ASP.NET Core, and API development connected to a modern frontend.

## What It Does

The app allows users to manage job opportunities through a simple web interface.

For each job offer, it is possible to store:

- company
- role
- location
- minimum and maximum salary range
- contract type
- application status
- application date
- contact person
- job post link
- personal notes

The goal is to simulate a small real-world management application: more complete than a basic todo app, but still simple enough to build step by step.

## Features

The project currently includes the main CRUD features:

- view the list of job offers
- add a new job offer
- edit an existing job offer
- delete a job offer
- confirmation before deleting an offer
- basic form validation
- immediate list update after creating, editing, or deleting an offer
- frontend-backend connection check

Edit and delete actions are available directly on each job card. The action buttons appear when hovering over a job application card.

## Tech Stack

Backend:

- C#
- ASP.NET Core Web API
- .NET 10

Frontend:

- Modern Angular
- TypeScript
- Reactive Forms
- SCSS
- Bootstrap

Tools:

- Angular CLI
- npm
- Vitest for frontend tests

## Current Project Status

This is an initial working version focused on validating the complete application flow:

```text
Angular frontend -> HTTP request -> ASP.NET Core backend -> JSON response -> UI update
```

For now, data is stored in memory on the backend. This means that job offers created, edited, or deleted through the UI are available only while the backend process is running, and they are reset when the backend restarts.

This is intentional: the first goal was to build and verify the communication between frontend and backend. The project can later be extended with a real database.

## Possible Future Improvements

Planned next steps include:

- PostgreSQL integration
- Entity Framework Core integration
- database migrations
- filters by status, contract type, and company
- text search
- sorting job applications
- user authentication
- dashboard with statistics
- notes and reminders connected to job applications

## Repository Structure

```text
jobtraci/
├── JobTracker.Api/   ASP.NET Core backend
├── frontend/         Angular frontend
├── JobTracker.slnx
└── README.md
```

## How To Run The Project

### Prerequisites

You need:

- .NET SDK 10
- Node.js
- npm
- Angular CLI

You can check your installations with:

```bash
dotnet --version
node -v
npm -v
ng version
```

### Install Dependencies

From the repository root:

```bash
dotnet restore JobTracker.slnx
```

Then install the frontend dependencies:

```bash
cd frontend
npm install
```

### Start The Backend

From the repository root:

```bash
dotnet run --project JobTracker.Api/JobTracker.Api.csproj
```

The backend will be available at:

```text
http://localhost:5000
```

### Start The Frontend

In a second terminal:

```bash
cd frontend
npm start
```

The frontend will be available at:

```text
http://localhost:4200
```

If Angular starts on `http://127.0.0.1:4200`, that is fine too: the backend is already configured to accept that origin.

## Useful Commands

Build backend:

```bash
dotnet build JobTracker.slnx
```

Build frontend:

```bash
cd frontend
npm run build
```

Run frontend tests:

```bash
cd frontend
npm test -- --watch=false
```

## Note

This project is a work in progress and was mainly created as a practical exercise to learn full stack development with C#, ASP.NET Core, and Angular.
