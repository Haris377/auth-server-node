-- CreateTable
CREATE TABLE IF NOT EXISTS "project_team_members" (
    "id" SERIAL NOT NULL,
    "project_id" VARCHAR(255),
    "member_email" VARCHAR(255),
    "role" VARCHAR(100),
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_team_members_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

