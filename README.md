# WMC-Transport – Full Stack Logistics Platform (AWS Deployed)

Live production system for transport order management, real-time tracking, and online payments.

🌐 Live Demo: https://www.wmc-transport.online

---

## Overview

WMC-Transport is a full-stack web application designed to digitalize and automate the operations of a transportation company.

The platform supports three roles:

- Clients – create and track transport orders  
- Drivers – manage assigned deliveries and share live location  
- Administrators – manage orders, users, and payments  

The system is fully deployed on AWS cloud infrastructure and operates as a real production environment, not only as a university prototype.

---

## Key Features

- Role-based authentication (Client / Driver / Admin)
- Transport order creation and management
- Driver assignment system
- Real-time tracking using Google Maps
- Secure online payments via Stripe
- Automated email notifications
- Admin dashboard for full system control
- Responsive user interface
- Production deployment with HTTPS

---

## Technology Stack

### Frontend
- React (JavaScript)
- HTML5, CSS3
- Vite

### Backend
- Node.js
- Express.js
- REST API architecture

### Database
- MySQL (hosted on AWS EC2)

### Cloud & Infrastructure
- AWS EC2 (Ubuntu)
- Nginx (reverse proxy)
- PM2 (process manager)
- SSL / HTTPS

### External Services
- Google Maps API (tracking & geolocation)
- Stripe API (payments)
- SMTP email service

---

## System Architecture

The application follows a client–server architecture:

- React frontend communicates with the backend via REST APIs  
- Node.js backend handles authentication, business logic, payments, and database access  
- MySQL database runs locally on the same EC2 instance and is not publicly exposed  

Security measures include:

- AWS security groups  
- Linux firewall rules  
- environment variables for secrets  
- no public database access  

---

## My Contributions (Backend & Cloud)

My main responsibilities in this project:

- Designed and implemented the backend API using Node.js and Express  
- Created the MySQL database schema and queries  
- Implemented Stripe payment integration (checkout + webhooks)  
- Built the email notification system  
- Deployed the backend and database on AWS EC2 (Ubuntu)  
- Configured PM2 for production process management  
- Configured Nginx reverse proxy  
- Implemented environment-based configuration using `.env`  
- Secured database access (local-only connections)  
- Participated in system architecture design and API contracts  


---

## Local Setup 

The system is already live. Local execution is optional and intended for development/testing.

### Backend


cd backend
npm install
npm run dev



Default port: 3000

Frontend
cd frontend
npm install
npm run dev

Default port: 5173

Create a .env file in the backend folder for:

database credentials

Stripe keys

Google Maps API key

Demo Accounts (Public)

These accounts are temporary and restricted to academic testing purposes only.

Client

Email: doe@yahoo.com

Password: doe1234

To complete the test payment, please use the following Stripe test card details:

Card number: 4242 4242 4242 4242

Expiration date: any future date (MM/YY)

CVC: any 3-digit number

These details work only in test mode and will not result in a real charge.

Email: driver@yahoo.com

Password: driver1234

Administrator credentials are not publicly shared for security reasons and can be provided to academic evaluators upon request.

Team

Vasile Bejan – Backend Development & Cloud Deployment

Bianca Bejan – Frontend Development & UI/UX

Andrei Mateiuc – Project Management & System Analysis

Why this project matters

This project demonstrates:

Full-stack development skills

Cloud deployment (AWS)

Real database design

Payment system integration

API design

Production configuration (Nginx + PM2)

Team collaboration using Git

Real system accessible online

Contact

GitHub: https://github.com/vasile007

LinkedIn: www.linkedin.com/in/vasile-bejan-777bba333








