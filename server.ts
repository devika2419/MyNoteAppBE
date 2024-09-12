import express, { NextFunction } from 'express';
import cors from 'cors';
import { registerUser, checkUser, saveDocumentUrl, getDetails, getFileDetails } from './queries';
import multer from 'multer';
import path from 'path';
import jwt, { JwtPayload, VerifyErrors, VerifyCallback } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: '*',
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('Static folder path:', path.join(__dirname, '../uploads'));

interface JwtUserPayload extends JwtPayload {
  user_id: string; 
}
interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

// JWT authentication middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
    if (err) {
      console.log(token)
      return res.status(403).json({ message: 'Invalid token' });
    }

    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      req.user = decoded as JwtUserPayload; // Cast the decoded payload to your JwtUserPayload type
      next(); 
    } else {
      return res.status(403).json({ message: 'Invalid token structure' });
    }
  });
}

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); 
      }
});

const upload = multer({ storage: storage });

app.post("/register", async (req, res) => {
  try {
      const { username, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
          return res.status(400).json({ error: "Passwords do not match." });
      }

      try {
          const { userId, token } = await registerUser(username, password);
          return res.status(201).json({ userId, token });
      } catch (error) {
          return res.status(400).json({ error: error });
      }

  } catch (err) {
      return res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post("/check-user", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(req.body);
        
        const data = await checkUser(username, password);
        
        if (data) {
            console.log(data);
            const user_id = data.user_id;
            
            const token = jwt.sign({ userId: user_id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
            console.log("Generated Token Payload:", jwt.decode(token));

            return res.status(200).json({
              token,
              success: true
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
    } catch (err) {
        console.error('Error in /check-user:', err);
        return res.status(500).json({ error: 'Failed to obtain data' });
    }
});


app.post('/upload', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`;
      const userId = req.user?.userId;  // Change user_id to userId

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const data = await saveDocumentUrl(userId, filePath);

      if (data) {
        res.status(200).json({
          success: true,
          message: "File uploaded successfully"
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Error saving file URL"
        });
      }
    } else {
      res.status(400).json({ success: false, message: 'No file uploaded' });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ success: false, message: 'Error processing file' });
  }
});



app.get("/get-details", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    console.log(userId)  
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const data = await getDetails(userId);

    if (data) {
      console.log(data);
      const name = data[0].name;
      console.log("Name:", name);

      return res.status(200).json({
        name: name,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  } catch (err) {
    console.error('Error in /get-details:', err);
    return res.status(500).json({ error: 'Failed to obtain data' });
  }
});


app.get('/get-files', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;  
    console.log(userId);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const data = await getFileDetails(userId);

    if (data && data[0].document_url) {
      const documentUrls = data[0].document_url;
      res.json({ success: true, files: documentUrls });
    } else {
      res.json({ success: false, message: "No files found", files: [] });
    }
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, message: 'Error fetching files' });
  }
});


app.listen(8080, () => {
    console.log("Listening on port 8080");
});
