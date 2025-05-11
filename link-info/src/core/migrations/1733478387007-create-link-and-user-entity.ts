import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLinkAndUserEntity1733478387007
  implements MigrationInterface
{
  name = 'CreateLinkAndUserEntity1733478387007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying(60) NOT NULL, "username" character varying(60) NOT NULL, "password" character varying(100) NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "link" character varying NOT NULL, CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "link-info" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "record" text array NOT NULL, "link_id" uuid NOT NULL, CONSTRAINT "REL_43a33fd8cce6c22e956bc31077" UNIQUE ("link_id"), CONSTRAINT "PK_c4103db1523817fa40ea8259c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "FK_da35233ec2bfaa121bb3540039b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link-info" ADD CONSTRAINT "FK_43a33fd8cce6c22e956bc310772" FOREIGN KEY ("link_id") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "link-info" DROP CONSTRAINT "FK_43a33fd8cce6c22e956bc310772"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "FK_da35233ec2bfaa121bb3540039b"`,
    );
    await queryRunner.query(`DROP TABLE "link-info"`);
    await queryRunner.query(`DROP TABLE "link"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
