# ProfitPros - Academic Internship Project

## Overview
ProfitPros is a full-stack web application for business profit/loss analysis. Users can calculate financial metrics based on product sales, theft, and unsold inventory.

## Live Demo
- **Frontend & PHP App:** https://academic-internship-project-php.onrender.com
- **Backend API:** https://academic-internship-project.onrender.com

## Technologies Used
- **Frontend:** HTML5, CSS3, JavaScript, PHP, Chart.js, TradingView Widgets
- **Backend:** Node.js, Express.js, PostgreSQL (Supabase), JWT, bcrypt
- **Testing:** Playwright
- **Deployment:** Render, Supabase

---

## Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [XAMPP](https://www.apachefriends.org/)
- [Supabase](https://supabase.com) account

Clone the repository:
```bash
git clone https://github.com/JamieNolan1/Academic-Internship-Project.git
cd Academic-Internship-Project


create an account at Supabase, create a new project, go to the SQL editor, do a new query and run the script from the backend/database.sql file, and find your connection string and copy it 

Navigate to the backend folder, install dependencies, create an .env file with your connection string and jwt secret

start the server

cd backend
npm install

create an .env file:
DATABASE_URL=postgresql://postgres:your_password@your-project.supabase.co:5432/postgres
JWT_SECRET=your_secret_key_here
PORT=3000

start the backend

npm run dev

for front end , enable PHP cURL by finding ;extension=curl in xammp\php\php.ini and remove the semicolon. update any API_BASE_URL in the loginfunction/signupfunction javascript files to http://localhost:3000/api. Copy the project folder over to your htdocs folder in xammp, and start xammp

troubleshooting:
if port 80 is already in use, change apaches port in c:\xammp\apache\conf\httpd.conf
if database connection fails, chedck your env connection and ensure PostgreSQL or supabase is running and that all of your credentials are correct

Contributors:
Jamie Nolan
Daniel Massey
Peter Burke

licence:
 Academic Internship project