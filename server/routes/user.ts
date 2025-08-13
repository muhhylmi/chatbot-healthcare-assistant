import { RequestHandler } from "express";
import { AuthResponse } from "@shared/api";
import { supabase, isSupabaseAvailable } from "../lib/supabase";
import { createHash, randomBytes } from 'crypto';

// Fallback in-memory storage when Supabase is not configured
let fallbackUsers: Array<any> = [];

// Get fallback users from auth routes (shared storage)
import { fallbackUsers as authFallbackUsers } from "./auth";

interface UpdateProfileRequest {
    fullName: string;
    email: string;
}

interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// Password hashing function (same as in auth.ts)
const hashPassword = (password: string, salt?: string): { hash: string; salt: string } => {
    const passwordSalt = salt || randomBytes(16).toString('hex');
    const hash = createHash('sha256').update(password + passwordSalt).digest('hex');
    return { hash, salt: passwordSalt };
};

const verifyPassword = (password: string, hash: string, salt: string): boolean => {
    const hashedPassword = createHash('sha256').update(password + salt).digest('hex');
    return hashedPassword === hash;
};

export const handleUpdateProfile: RequestHandler = async (req, res) => {
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
        let decoded: any;

        try {
            decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        } catch {
            const response: AuthResponse = {
                success: false,
                message: "Invalid token"
            };
            return res.status(401).json(response);
        }

        const { fullName, email }: UpdateProfileRequest = req.body;

        if (!fullName || !email) {
            const response: AuthResponse = {
                success: false,
                message: "Full name and email are required"
            };
            return res.status(400).json(response);
        }

        if (isSupabaseAvailable() && supabase) {
            // Supabase update
            const { data: updatedUser, error } = await supabase
                .from('users')
                .update({
                    full_name: fullName,
                    email: email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', decoded.userId)
                .select()
                .single();

            if (error) {
                const response: AuthResponse = {
                    success: false,
                    message: "Failed to update profile"
                };
                return res.status(500).json(response);
            }

            const response: AuthResponse = {
                success: true,
                message: "Profile updated successfully",
                user: {
                    id: updatedUser.id,
                    fullName: updatedUser.full_name,
                    email: updatedUser.email
                }
            };

            res.json(response);
        } else {
            // Fallback update
            const userIndex = authFallbackUsers.findIndex(u => u.id === decoded.userId);

            if (userIndex === -1) {
                const response: AuthResponse = {
                    success: false,
                    message: "User not found"
                };
                return res.status(404).json(response);
            }

            authFallbackUsers[userIndex].fullName = fullName;
            authFallbackUsers[userIndex].email = email;

            const response: AuthResponse = {
                success: true,
                message: "Profile updated successfully",
                user: {
                    id: authFallbackUsers[userIndex].id,
                    fullName: authFallbackUsers[userIndex].fullName,
                    email: authFallbackUsers[userIndex].email
                }
            };

            res.json(response);
        }
    } catch (error) {
        console.error('Update profile error:', error);
        const response: AuthResponse = {
            success: false,
            message: "Internal server error"
        };
        res.status(500).json(response);
    }
};

export const handleUpdatePassword: RequestHandler = async (req, res) => {
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
        let decoded: any;

        try {
            decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        } catch {
            const response: AuthResponse = {
                success: false,
                message: "Invalid token"
            };
            return res.status(401).json(response);
        }

        const { currentPassword, newPassword }: UpdatePasswordRequest = req.body;

        if (!currentPassword || !newPassword) {
            const response: AuthResponse = {
                success: false,
                message: "Current password and new password are required"
            };
            return res.status(400).json(response);
        }

        if (newPassword.length < 6) {
            const response: AuthResponse = {
                success: false,
                message: "New password must be at least 6 characters long"
            };
            return res.status(400).json(response);
        }

        if (isSupabaseAvailable() && supabase) {
            // Get current user from Supabase
            const { data: user, error: findError } = await supabase
                .from('users')
                .select('*')
                .eq('id', decoded.userId)
                .single();

            if (findError || !user) {
                const response: AuthResponse = {
                    success: false,
                    message: "User not found"
                };
                return res.status(404).json(response);
            }

            // Verify current password
            const [hash, salt] = user.password_hash.split(':');
            if (!verifyPassword(currentPassword, hash, salt)) {
                const response: AuthResponse = {
                    success: false,
                    message: "Current password is incorrect"
                };
                return res.status(400).json(response);
            }

            // Hash new password
            const { hash: newHash, salt: newSalt } = hashPassword(newPassword);
            const newPasswordHash = `${newHash}:${newSalt}`;

            // Update password
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    password_hash: newPasswordHash,
                    updated_at: new Date().toISOString()
                })
                .eq('id', decoded.userId);

            if (updateError) {
                const response: AuthResponse = {
                    success: false,
                    message: "Failed to update password"
                };
                return res.status(500).json(response);
            }

            const response: AuthResponse = {
                success: true,
                message: "Password updated successfully"
            };

            res.json(response);
        } else {
            // Fallback update
            const user = authFallbackUsers.find(u => u.id === decoded.userId);

            if (!user) {
                const response: AuthResponse = {
                    success: false,
                    message: "User not found"
                };
                return res.status(404).json(response);
            }

            // Verify current password
            if (!verifyPassword(currentPassword, user.password, user.salt)) {
                const response: AuthResponse = {
                    success: false,
                    message: "Current password is incorrect"
                };
                return res.status(400).json(response);
            }

            // Update password
            const { hash, salt } = hashPassword(newPassword);
            user.password = hash;
            user.salt = salt;

            const response: AuthResponse = {
                success: true,
                message: "Password updated successfully"
            };

            res.json(response);
        }
    } catch (error) {
        console.error('Update password error:', error);
        const response: AuthResponse = {
            success: false,
            message: "Internal server error"
        };
        res.status(500).json(response);
    }
};
