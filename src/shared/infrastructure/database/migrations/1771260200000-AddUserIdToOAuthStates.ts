import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the nullable `user_id` binding to oauth_states, used by the authenticated
 * account-linking flow to bind a state to the initiating user (link-CSRF defense).
 * Separate from AddOAuthStates because that migration is already released.
 */
export class AddUserIdToOAuthStates1771260200000 implements MigrationInterface {
  name = 'AddUserIdToOAuthStates1771260200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "oauth_states" ADD "user_id" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "oauth_states" DROP COLUMN "user_id"`);
  }
}
