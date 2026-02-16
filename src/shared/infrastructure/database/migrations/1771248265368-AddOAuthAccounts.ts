import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthAccounts1771248265368 implements MigrationInterface {
  name = 'AddOAuthAccounts1771248265368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "oauth_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "provider" character varying(50) NOT NULL, "provider_user_id" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, CONSTRAINT "UQ_ea7720e04e3ae1278575c3159cf" UNIQUE ("provider", "provider_user_id"), CONSTRAINT "PK_710a81523f515b78f894e33bb10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_22a05e92f51a983475f9281d3b" ON "oauth_accounts" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_6a26db06330305c66a22e14ab3" ON "oauth_accounts" ("provider") `);
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" ADD CONSTRAINT "FK_22a05e92f51a983475f9281d3b0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "oauth_accounts" DROP CONSTRAINT "FK_22a05e92f51a983475f9281d3b0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6a26db06330305c66a22e14ab3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_22a05e92f51a983475f9281d3b"`);
    await queryRunner.query(`DROP TABLE "oauth_accounts"`);
  }
}
