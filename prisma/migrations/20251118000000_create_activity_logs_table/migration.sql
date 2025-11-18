-- CreateTable
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" SERIAL NOT NULL,
    "activity_id" VARCHAR(255),
    "project_id" VARCHAR(255),
    "task_id" VARCHAR(255),
    "activity_type" VARCHAR(100),
    "description" TEXT,
    "user_email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

