-- Drop existing tables if they exist (with different structure)
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;

-- Create projects table
CREATE TABLE IF NOT EXISTS "projects" (
    "id" SERIAL NOT NULL,
    "project_id" VARCHAR(255) NOT NULL,
    "project_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "priority" VARCHAR(50),
    "status" VARCHAR(50),
    "budget" DECIMAL(10,2),
    "client_name" VARCHAR(255),
    "project_manager" VARCHAR(255),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completion_percentage" INTEGER DEFAULT 0,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on project_id
CREATE UNIQUE INDEX IF NOT EXISTS "projects_project_id_key" ON "projects"("project_id");

-- Create tasks table
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" SERIAL NOT NULL,
    "task_id" VARCHAR(255) NOT NULL,
    "project_id" VARCHAR(255),
    "task_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "assigned_to" VARCHAR(255),
    "priority" VARCHAR(50),
    "status" VARCHAR(50),
    "due_date" DATE,
    "estimated_hours" DECIMAL(5,2),
    "actual_hours" DECIMAL(5,2) DEFAULT 0,
    "tags" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on task_id
CREATE UNIQUE INDEX IF NOT EXISTS "tasks_task_id_key" ON "tasks"("task_id");

-- Add foreign key constraint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" 
    FOREIGN KEY ("project_id") 
    REFERENCES "projects"("project_id") 
    ON UPDATE NO ACTION 
    ON DELETE NO ACTION;

