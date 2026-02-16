import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1771239689299 implements MigrationInterface {
  name = 'InitialSchema1771239689299';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "resource" character varying(100) NOT NULL, "action" character varying(100) NOT NULL, "description" character varying(255) NOT NULL DEFAULT '', CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_7331684c0c5b063803a425001a" ON "permissions" ("resource", "action") `);
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "description" character varying(255) NOT NULL DEFAULT '', "is_default" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_648e3f5447f725579d7d4ffdfb" ON "roles" ("name") `);
    await queryRunner.query(`CREATE INDEX "IDX_0cd84a187bbe36fa464325fb90" ON "roles" ("is_default") `);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying(255) NOT NULL, "password" character varying(255), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying(500) NOT NULL, "user_id" uuid NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_revoked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token") `);
    await queryRunner.query(`CREATE INDEX "IDX_3ddc983c5f7bcf132fd8732c3f" ON "refresh_tokens" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_ba3bd69c8ad1e799c0256e9e50" ON "refresh_tokens" ("expires_at") `);
    await queryRunner.query(
      `CREATE TABLE "otp_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(6) NOT NULL, "email" character varying(255) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "attempts" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0487965ac1837d57fec4d6a26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_9e85e1945c47dfb71042ae5d19" ON "otp_codes" ("email") `);
    await queryRunner.query(
      `CREATE TABLE "audit_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "action" character varying(100) NOT NULL, "resource" character varying(100) NOT NULL, "resource_id" character varying(255), "user_id" uuid, "user_email" character varying(255), "ip_address" character varying(45) NOT NULL, "method" character varying(10) NOT NULL, "path" character varying(2048) NOT NULL, "status_code" integer NOT NULL, "metadata" jsonb, "duration" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_6b1623bcad4d04530b76548d619" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_audit_entries_action" ON "audit_entries" ("action") `);
    await queryRunner.query(`CREATE INDEX "idx_audit_entries_resource" ON "audit_entries" ("resource") `);
    await queryRunner.query(`CREATE INDEX "idx_audit_entries_user_id" ON "audit_entries" ("user_id") `);
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP INDEX "public"."idx_audit_entries_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_audit_entries_resource"`);
    await queryRunner.query(`DROP INDEX "public"."idx_audit_entries_action"`);
    await queryRunner.query(`DROP TABLE "audit_entries"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9e85e1945c47dfb71042ae5d19"`);
    await queryRunner.query(`DROP TABLE "otp_codes"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ba3bd69c8ad1e799c0256e9e50"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3ddc983c5f7bcf132fd8732c3f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0cd84a187bbe36fa464325fb90"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_648e3f5447f725579d7d4ffdfb"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7331684c0c5b063803a425001a"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
