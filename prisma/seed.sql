-- Initial Roles
INSERT INTO roles (id, name, description, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'ADMIN', 'Administrator with full access', NOW(), NOW()),
  (gen_random_uuid(), 'USER', 'Regular user with limited access', NOW(), NOW()),
  (gen_random_uuid(), 'MANAGER', 'Manager with department access', NOW(), NOW());

-- Initial Permissions
INSERT INTO permissions (id, name, description, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'CREATE_USER', 'Can create new users', NOW(), NOW()),
  (gen_random_uuid(), 'READ_USER', 'Can view user details', NOW(), NOW()),
  (gen_random_uuid(), 'UPDATE_USER', 'Can update user details', NOW(), NOW()),
  (gen_random_uuid(), 'DELETE_USER', 'Can delete users', NOW(), NOW()),
  (gen_random_uuid(), 'MANAGE_ROLES', 'Can manage roles', NOW(), NOW()),
  (gen_random_uuid(), 'MANAGE_PERMISSIONS', 'Can manage permissions', NOW(), NOW());

-- Assign permissions to roles
-- First, get role IDs
DO $$
DECLARE
    admin_role_id UUID;
    user_role_id UUID;
    manager_role_id UUID;
    
    create_user_perm_id UUID;
    read_user_perm_id UUID;
    update_user_perm_id UUID;
    delete_user_perm_id UUID;
    manage_roles_perm_id UUID;
    manage_permissions_perm_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ADMIN';
    SELECT id INTO user_role_id FROM roles WHERE name = 'USER';
    SELECT id INTO manager_role_id FROM roles WHERE name = 'MANAGER';
    
    -- Get permission IDs
    SELECT id INTO create_user_perm_id FROM permissions WHERE name = 'CREATE_USER';
    SELECT id INTO read_user_perm_id FROM permissions WHERE name = 'READ_USER';
    SELECT id INTO update_user_perm_id FROM permissions WHERE name = 'UPDATE_USER';
    SELECT id INTO delete_user_perm_id FROM permissions WHERE name = 'DELETE_USER';
    SELECT id INTO manage_roles_perm_id FROM permissions WHERE name = 'MANAGE_ROLES';
    SELECT id INTO manage_permissions_perm_id FROM permissions WHERE name = 'MANAGE_PERMISSIONS';
    
    -- Admin role gets all permissions
    INSERT INTO role_permissions ("roleId", "permissionId", "assignedAt")
    VALUES 
      (admin_role_id, create_user_perm_id, NOW()),
      (admin_role_id, read_user_perm_id, NOW()),
      (admin_role_id, update_user_perm_id, NOW()),
      (admin_role_id, delete_user_perm_id, NOW()),
      (admin_role_id, manage_roles_perm_id, NOW()),
      (admin_role_id, manage_permissions_perm_id, NOW());
    
    -- Manager role gets some permissions
    INSERT INTO role_permissions ("roleId", "permissionId", "assignedAt")
    VALUES 
      (manager_role_id, create_user_perm_id, NOW()),
      (manager_role_id, read_user_perm_id, NOW()),
      (manager_role_id, update_user_perm_id, NOW());
    
    -- User role gets minimal permissions
    INSERT INTO role_permissions ("roleId", "permissionId", "assignedAt")
    VALUES 
      (user_role_id, read_user_perm_id, NOW());
END $$;
