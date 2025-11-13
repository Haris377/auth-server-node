-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- Insert default departments
INSERT INTO "departments" (id, name, description, created_at, updated_at) 
VALUES 
(1, 'Engineering', 'Software Engineering Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Marketing', 'Marketing Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Sales', 'Sales Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'HR', 'Human Resources Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Finance', 'Finance Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Operations', 'Operations Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Customer Support', 'Customer Support Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Product', 'Product Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'Design', 'Design Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'Legal', 'Legal Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;