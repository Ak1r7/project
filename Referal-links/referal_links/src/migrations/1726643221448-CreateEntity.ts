import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEntity1726643221448 implements MigrationInterface {
    name = 'CreateEntity1726643221448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "referralCount" integer NOT NULL DEFAULT '0', "balance" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_16f6cb1674a934b41b915a46ae0" PRIMARY KEY ("id", "username"))`);
        await queryRunner.query(`CREATE TABLE "link" ("id" SERIAL NOT NULL, "link" character varying NOT NULL, CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "link"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
