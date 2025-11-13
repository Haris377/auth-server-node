-- Insert default departments if they don't exist
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
