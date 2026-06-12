import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthStates1771260000000 implements MigrationInterface {
  name = 'AddOAuthStates1771260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "oauth_states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "state" character varying(128) NOT NULL, "provider" character varying(50) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_oauth_states_state" UNIQUE ("state"), CONSTRAINT "PK_oauth_states_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_oauth_states_state" ON "oauth_states" ("state") `);
    await queryRunner.query(`CREATE INDEX "IDX_oauth_states_expires_at" ON "oauth_states" ("expires_at") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_oauth_states_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_oauth_states_state"`);
    await queryRunner.query(`DROP TABLE "oauth_states"`);
  }
}
