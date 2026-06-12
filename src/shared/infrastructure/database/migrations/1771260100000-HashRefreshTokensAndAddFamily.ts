import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Hardens refresh-token storage:
 *  - stores only a SHA-256 hash of the token (no plaintext), and
 *  - adds a `family_id` rotation lineage to enable reuse detection.
 *
 * Existing plaintext tokens cannot be migrated to hashes, so they are cleared:
 * every user re-authenticates once after this migration runs.
 */
export class HashRefreshTokensAndAddFamily1771260100000 implements MigrationInterface {
  name = 'HashRefreshTokensAndAddFamily1771260100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Invalidate all existing (plaintext) refresh tokens — they cannot be re-hashed.
    await queryRunner.query(`DELETE FROM "refresh_tokens"`);

    // Drop the old plaintext token column, its index and unique constraint.
    await queryRunner.query(`DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "token"`);

    // Hashed token.
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "token_hash" character varying(64) NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_refresh_tokens_token_hash" UNIQUE ("token_hash")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash") `);

    // Rotation lineage.
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "family_id" uuid NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_family_id" ON "refresh_tokens" ("family_id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_family_id"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "family_id"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_token_hash"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_refresh_tokens_token_hash"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "token_hash"`);

    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "token" character varying(500) NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token") `);
  }
}
