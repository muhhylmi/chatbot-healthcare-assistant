import { RequestHandler } from "express";
import { LoginRequest, SignupRequest, AuthResponse, User } from "@shared/api";
import { supabase, DatabaseUser, isSupabaseAvailable } from "../lib/supabase";
import { createHash, randomBytes } from 'crypto';

// Fallback in-memory storage when Supabase is not configured
const fallbackUsers: Array<User & { password: string; salt: string }> = [];

// Password hashing using crypto
const hashPassword = (password: string, salt?: string): { hash: string; salt: string } => {
  const passwordSalt = salt || randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + passwordSalt).digest('hex');
  return { hash, salt: passwordSalt };
};

const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const hashedPassword = createHash('sha256').update(password + salt).digest('hex');
  return hashedPassword === hash;
};

// Generate JWT-like token (in production, use proper JWT)
const generateToken = (userId: string): string => {
  const payload = {
    userId,
    timestamp: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const { fullName, email, password }: SignupRequest = req.body;

    // Validation
    if (!fullName || !email || !password) {
      const response: AuthResponse = {
        success: false,
        message: "All fields are required"
      };
      return res.status(400).json(response);
    }

    if (password.length < 6) {
      const response: AuthResponse = {
        success: false,
        message: "Password must be at least 6 characters long"
      };
      return res.status(400).json(response);
    }

    // Use Supabase if available, otherwise use fallback
    if (isSupabaseAvailable() && supabase) {
      // Supabase path
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Database error checking user:', checkError);
        const response: AuthResponse = {
          success: false,
          message: "Database error. Please try again."
        };
        return res.status(500).json(response);
      }

      if (existingUser) {
        const response: AuthResponse = {
          success: false,
          message: "User with this email already exists"
        };
        return res.status(400).json(response);
      }

      // Hash password
      const { hash, salt } = hashPassword(password);
      const passwordHash = `${hash}:${salt}`;

      // Create user in database
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          full_name: fullName,
          email: email,
          password_hash: passwordHash
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database error creating user:', insertError);
        const response: AuthResponse = {
          success: false,
          message: "Failed to create account. Please try again."
        };
        return res.status(500).json(response);
      }

      // Generate token
      const token = generateToken(newUser.id);

      const response: AuthResponse = {
        success: true,
        message: "Account created successfully",
        user: {
          id: newUser.id,
          fullName: newUser.full_name,
          email: newUser.email
        },
        token
      };

      res.json(response);
    } else {
      // Fallback in-memory storage
      console.log('Using fallback in-memory storage for user registration');
      
      // Check if user already exists
      const existingUser = fallbackUsers.find(user => user.email === email);
      if (existingUser) {
        const response: AuthResponse = {
          success: false,
          message: "User with this email already exists"
        };
        return res.status(400).json(response);
      }

      // Hash password
      const { hash, salt } = hashPassword(password);

      // Create new user
      const newUser: User & { password: string; salt: string } = {
        id: Date.now().toString(),
        fullName,
        email,
        password: hash,
        salt,
        createdAt: new Date()
      };

      fallbackUsers.push(newUser);

      // Generate token
      const token = generateToken(newUser.id);

      const response: AuthResponse = {
        success: true,
        message: "Account created successfully (using fallback storage)",
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email
        },
        token
      };

      res.json(response);
    }
  } catch (error) {
    console.error('Signup error:', error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error"
    };
    res.status(500).json(response);
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      const response: AuthResponse = {
        success: false,
        message: "Email and password are required"
      };
      return res.status(400).json(response);
    }

    // Use Supabase if available, otherwise use fallback
    if (isSupabaseAvailable() && supabase) {
      // Supabase path
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (findError || !user) {
        const response: AuthResponse = {
          success: false,
          message: "Invalid email or password"
        };
        return res.status(401).json(response);
      }

      // Verify password
      const [hash, salt] = user.password_hash.split(':');
      if (!verifyPassword(password, hash, salt)) {
        const response: AuthResponse = {
          success: false,
          message: "Invalid email or password"
        };
        return res.status(401).json(response);
      }

      // Generate token
      const token = generateToken(user.id);

      const response: AuthResponse = {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email
        },
        token
      };

      res.json(response);
    } else {
      // Fallback in-memory storage
      console.log('Using fallback in-memory storage for user login');
      
      // Find user
      const user = fallbackUsers.find(u => u.email === email);
      if (!user) {
        const response: AuthResponse = {
          success: false,
          message: "Invalid email or password"
        };
        return res.status(401).json(response);
      }

      // Verify password
      if (!verifyPassword(password, user.password, user.salt)) {
        const response: AuthResponse = {
          success: false,
          message: "Invalid email or password"
        };
        return res.status(401).json(response);
      }

      // Generate token
      const token = generateToken(user.id);

      const response: AuthResponse = {
        success: true,
        message: "Login successful (using fallback storage)",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email
        },
        token
      };

      res.json(response);
    }
  } catch (error) {
    console.error('Login error:', error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error"
    };
    res.status(500).json(response);
  }
};

export const handleGetProfile: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: AuthResponse = {
        success: false,
        message: "Authorization token required"
      };
      return res.status(401).json(response);
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check token expiration
      if (decoded.exp && decoded.exp < Date.now()) {
        const response: AuthResponse = {
          success: false,
          message: "Token expired"
        };
        return res.status(401).json(response);
      }

      // Use Supabase if available, otherwise use fallback
      if (isSupabaseAvailable() && supabase) {
        // Supabase path
        const { data: user, error: findError } = await supabase
          .from('users')
          .select('id, full_name, email, created_at')
          .eq('id', decoded.userId)
          .single();
        
        if (findError || !user) {
          const response: AuthResponse = {
            success: false,
            message: "Invalid token"
          };
          return res.status(401).json(response);
        }

        const response: AuthResponse = {
          success: true,
          message: "Profile retrieved successfully",
          user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email
          }
        };

        res.json(response);
      } else {
        // Fallback in-memory storage
        const user = fallbackUsers.find(u => u.id === decoded.userId);
        
        if (!user) {
          const response: AuthResponse = {
            success: false,
            message: "Invalid token"
          };
          return res.status(401).json(response);
        }

        const response: AuthResponse = {
          success: true,
          message: "Profile retrieved successfully (using fallback storage)",
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email
          }
        };

        res.json(response);
      }
    } catch {
      const response: AuthResponse = {
        success: false,
        message: "Invalid token"
      };
      res.status(401).json(response);
    }
  } catch (error) {
    console.error('Get profile error:', error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error"
    };
    res.status(500).json(response);
  }
};
