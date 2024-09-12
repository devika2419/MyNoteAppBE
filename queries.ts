import createDatabaseConnection from './db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


export async function registerUser(username: string, password: string): Promise<{ userId: string, token: string }> {
    try {
        console.log("Inside registerUser - Start");

        const connection = await createDatabaseConnection();

        // Check if username already exists
        const checkUserQuery = "SELECT * FROM users WHERE name = ?";
        const [existingUser] = await connection.execute<RowDataPacket[]>(checkUserQuery, [username]);
         console.log(existingUser)
        

        if (existingUser.length>1) {
            throw new Error('Username already exists. Please choose another one.');
        }

        const user_id = uuidv4();
        const trimmedPassword = password.trim();

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(trimmedPassword, saltRounds);

        const query = "INSERT INTO users (user_id, name, password) VALUES (?, ?, ?)";
        await connection.execute(query, [user_id, username, hashedPassword]);

        const token = jwt.sign({ userId: user_id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

        return { userId: user_id, token };

    } catch (err) {
        console.error('Error registering user:', (err as Error).message);
        throw err;
    }
}
export async function checkUser(username: string, password: string): Promise<any> {
    try {
        console.log("Inside checkUser - Start");

        const connection = await createDatabaseConnection(); 
        const trimmedPassword = password.trim();



        const query = "SELECT * FROM users WHERE name = ?";
        const [result] = await connection.execute<RowDataPacket[]>(query, [username]);


        if (!result) {
            console.log("User not found");
            return false;
        }

        for (const user of result) {
            const storedHashedPassword = user.password;

            const isPasswordCorrect = await bcrypt.compare(trimmedPassword, storedHashedPassword);

            if (isPasswordCorrect) {
                
                console.log("User authenticated successfully.");
                return user; 
            }
        }

        console.log("Incorrect password.");
        return false;


    } catch (err) {
        console.error('Error checking user:', (err as Error).stack);
        throw err;
    }
}
export async function saveDocumentUrl(userId: string, filePath: string): Promise<any> {
    try {
        const connection = await createDatabaseConnection();

        const query = `UPDATE users 
                       SET document_url = JSON_ARRAY_APPEND(IFNULL(document_url, '[]'), '$', ?) 
                       WHERE user_id = ?`;
        const [result] = await connection.execute<RowDataPacket[]>(query, [filePath, userId]);

        if (result) {
            console.log('File URL saved to the database');
            return result;
        }
    } catch (err) {
        console.error('Error saving file URL:', err);
        throw err;
    }
}




    export async function getDetails(userId: string): Promise<any> {
        try {
            console.log("Inside get Detials - Start");
    
            const connection = await createDatabaseConnection(); 

            
            const query = "SELECT name FROM users WHERE user_id = ?";
            const [result] = await connection.execute<RowDataPacket[]>(query, [userId]);
    
    
            if (result) {
                console.log('user data obtained');
                return result;
            }
    
            else{

                console.log("User data not obtained");
            

            }

    
        } catch (err) {
            console.error('Error obtaining data:', (err as Error).stack);
            throw err;
        }
    }

    export async function getFileDetails(userId: string): Promise<any> {
        console.log("Inside getFileDetails - Start");
    
        const connection = await createDatabaseConnection();
        
        const query = "SELECT document_url FROM users WHERE user_id = ?";
        const [result] = await connection.execute<RowDataPacket[]>(query, [userId]);
    
        if (result) {
            console.log(result);
            return result;
        } else {
            console.log("Error obtaining files!");
            return [];
        }
    }
    
