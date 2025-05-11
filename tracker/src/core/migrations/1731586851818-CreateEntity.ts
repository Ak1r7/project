import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEntity1731586851818 implements MigrationInterface {
    name = 'CreateEntity1731586851818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "password" character varying NOT NULL, "avatar_url" character varying NOT NULL DEFAULT '', "activate_at" TIMESTAMP, "socket_id" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "relation_task_to_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file" text array NOT NULL, CONSTRAINT "PK_f240629825e6339ee3b6aabe6ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "task_name" character varying NOT NULL, "task_description" character varying NOT NULL, "assigned_users" character varying, "created_task_user" character varying NOT NULL, "closed_task_user" character varying, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "task_status" boolean NOT NULL, "closed_at" TIMESTAMP, "comments" text array, "image_url" character varying, "deleted_at" TIMESTAMP, "taskFileId" uuid, CONSTRAINT "REL_f2aec8575d45cd0e788f38db76" UNIQUE ("taskFileId"), CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "from_user_id" character varying NOT NULL, "to_user_id" uuid array NOT NULL, "content" character varying NOT NULL, "accepted" boolean NOT NULL, "deleted_at" TIMESTAMP, "seen_at" TIMESTAMP, "file_id" text array, CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "relation_file_to_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "codes" text array NOT NULL, CONSTRAINT "PK_14dccfbf5244fd7bf127852fe9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rowColumn" integer NOT NULL, "code" character varying NOT NULL, "comments" character varying NOT NULL DEFAULT '', " user_id" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_367e70f79a9106b8e802e1a9825" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "user_id" character varying NOT NULL, "relationId" uuid, CONSTRAINT "REL_c82ac29ce30902f285b02a95ca" UNIQUE ("relationId"), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_f2aec8575d45cd0e788f38db76f" FOREIGN KEY ("taskFileId") REFERENCES "relation_task_to_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_c82ac29ce30902f285b02a95caa" FOREIGN KEY ("relationId") REFERENCES "relation_file_to_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_c82ac29ce30902f285b02a95caa"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_f2aec8575d45cd0e788f38db76f"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TABLE "code"`);
        await queryRunner.query(`DROP TABLE "relation_file_to_code"`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TABLE "relation_task_to_file"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
