import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { LoginUserInput } from '../types';
import emailService from './email.service';
import crypto from 'crypto';

// Ensure environment variables are loaded
dotenv.config();

const prisma = new PrismaClient();

export class AuthService {
  
  async login(loginData: LoginUserInput) {
    try {
      const { email, password } = loginData;
      console.log("🔐 Start login for:", email);

      // Add timeout wrapper for database query
      const queryPromise = prisma.user.findUnique({
        where: { email },
        include: {
          roles: { include: { role: true } },
        },
      });

      // Set a timeout for the database query (10 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 10000);
      });

      let user;
      try {
        user = await Promise.race([queryPromise, timeoutPromise]) as any;
        console.log("✅ User found:", user?.id);
      } catch (dbError: any) {
        console.error("❌ Database query error:", dbError.message);
        if (dbError.message === 'Database query timeout') {
          throw new Error('Database connection timeout. Please try again.');
        }
        throw new Error('Database error during login');
      }

      if (!user) {
        console.log("❌ User not found for email:", email);
        throw new Error('Invalid credentials');
      }

      const userWithHash = user as any;
      if (!userWithHash.password_hash) {
        console.log("❌ Password not set for user:", email);
        throw new Error('Password not set');
      }

      console.log("🔑 Comparing password...");
      const isPasswordValid = await bcrypt.compare(password, userWithHash.password_hash);
      console.log("🔑 Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("❌ Invalid password for user:", email);
        throw new Error('Invalid credentials');
      }

      const jwtSecret = 'your-super-secret-jwt-key-change-in-production';
      const jwtExpiresIn = '7d';

      const userRoles = user.roles.map((userRole: any) => userRole.role.name);

      console.log("🎫 Generating JWT token...");
      const token = jwt.sign(
        { userId: user.id, roles: userRoles },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );

      const { password_hash: _, roles, ...userWithoutPassword } = user as any;

      const formattedRoles = roles.map((userRole: any) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        description: userRole.role.description,
      }));

      console.log("✅ Login success for:", email);

      return {
        user: {
          ...userWithoutPassword,
          roles: formattedRoles,
        },
        token,
      };
    } catch (error: any) {
      console.error("❌ Error in login:", error.message || error);
      if (error.message === 'Invalid credentials' || error.message === 'Password not set') {
        throw error;
      }
      // For other errors, provide a more user-friendly message
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }
  
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove password from response and format roles
    const { password_hash: _, roles, ...userWithoutPassword } = user as any;
    
    // Format roles for the response
    const formattedRoles = roles.map((userRole: any) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description
    }));
    
    return {
      ...userWithoutPassword,
      roles: formattedRoles
    };
  }

  async register(registerData: {
    username: string;
    email: string;
    role: string;
    status: string;
    phone?: string;
    department_id?: number;
    location?: string;
    password?: string;
    created_by?: string;
  }) {
    const { username, email, role, status, password } = registerData;

    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    // Check if user already exists by username
    const existingUserByUsername = await prisma.user.findFirst({
      where: { username }
    });

    if (existingUserByUsername) {
      throw new Error('User with this username already exists');
    }

    // Find role by name
    const userRole = await prisma.role.findUnique({
      where: { name: role }
    });

    if (!userRole) {
      throw new Error(`Role ${role} not found`);
    }

    // Handle password hashing
    let hashedPassword: string;
    let emailToken: string | null = null;
    
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password.trim(), salt);
    } else {
      hashedPassword = '';
    }
    
    const { department_id, phone, location, created_by } = registerData;
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
        is_active: status === 'active',
        phone,
        department_id,
        location,
        created_by,
        roles: {
          create: {
            role_id: userRole.id
          }
        }
      } as any,
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Handle email notifications
    try {
      if (emailToken) {
        await emailService.sendPasswordSetupEmail(email, username, emailToken);
        console.log(`✅ Password setup email sent to ${email}`);
      } else {
        await emailService.sendWelcomeEmail(email, username);
        console.log(`✅ Welcome email sent to ${email}`);
      }
    } catch (error: any) {
      console.error('❌ Failed to send registration email:', error.message);
      if (error.code) {
        console.error(`   Error code: ${error.code}`);
      }
      console.warn(`⚠️  User created but email notification failed. User ID: ${user.id}`);
    }

    // Remove sensitive data from response
    const { password_hash: _, ...userWithoutSensitive } = user as any;

    return userWithoutSensitive;
  }

  async setPassword(email: string, password: string) {
    // Find user by email (emailToken columns don't exist in DB, so we use email for now)
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user with password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword
      } as any,
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Send confirmation email after password is set
    try {
      const userWithUsername = user as any;
      await emailService.sendWelcomeEmail(user.email, userWithUsername.username || user.email, true);
      console.log(`✅ Password confirmation email sent to ${user.email}`);
    } catch (error: any) {
      console.error('❌ Failed to send password confirmation email:', error.message);
      if (error.code) {
        console.error(`   Error code: ${error.code}`);
      }
      // Continue despite email failure - password is already set
    }

    // Remove sensitive data from response
    const { password_hash: _, roles, ...userWithoutSensitive } = updatedUser as any;

    // Format roles
    const formattedRoles = roles.map((userRole: { role: { id: string; name: string; description: string | null } }) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description
    }));

    return {
      ...userWithoutSensitive,
      roles: formattedRoles
    };
  }

  async getRoleById(roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    return role;
  }

  async forgotPassword(email: string){
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      throw new Error(`User with ${email} not found`);
    }

    try {
    await emailService.sendForgotPassword(email);
    console.log(`✅ Email sent to ${user.email}`);
    }catch(error: any){
      console.error('❌ Failed to send email:', error.message);
    }
  }
}
