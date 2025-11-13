# Department Table Setup

To properly display department information in the users grid, follow these steps:

## 1. Create the Departments Table

Run the following SQL commands in your PostgreSQL database:

```sql
-- Create departments table
CREATE TABLE IF NOT EXISTS "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- Create unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS "departments_name_key" ON "departments"("name");

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
(10, 'Legal', 'Legal Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
```

## 2. Add Foreign Key Constraint

After creating the departments table and inserting data, add the foreign key constraint:

```sql
-- Add foreign key constraint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

## 3. Restart the Server

After making these database changes, restart your server to ensure the changes take effect.

## 4. Testing

The `/api/users` endpoint should now return department information along with user data. The response will include:

```json
{
  "id": "user-id",
  "username": "username",
  "email": "user@example.com",
  "phone": "1234567890",
  "department_id": 1,
  "department": {
    "id": 1,
    "name": "Engineering",
    "description": "Software Engineering Department"
  },
  // other user fields...
}
```

This will allow you to display the department name in the users grid.
