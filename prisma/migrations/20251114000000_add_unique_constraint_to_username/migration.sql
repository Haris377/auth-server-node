-- Add unique constraint to username column in users table
ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE ("username");
