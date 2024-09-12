# MyNoteApp - Backend

Welcome to the MyNoteApp backend repository! This project provides the server-side logic for the MyNoteApp, built using Express.js and MySQL.

## Features

- **User Authentication:** Handle secure sign-up, login, and user management.
- **File Management:** Process and store file uploads.
- **Database Integration:** Use MySQL for data storage and retrieval.

## Technologies Used

- **Express.js:** For server operations, routing, and middleware.
- **MySQL:** For database management.
- **dotenv:** For managing environment variables.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/devika2419/MyNoteAppBE.git
   cd MyNoteAppBE

2. **Install Dependencies**

     ```bash
     npm i
 3. **Set Up Environment Variables**

     ### Environment Variables

    Create a .env file in the root directory and add the following variables:

     DB_HOST=your_database_host
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_NAME=your_database_name
     PORT=your_preferred_port

4. **Run the Application**

     ~~~bash
     npm run dev
