import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1773136015121 implements MigrationInterface {
  name = 'InitialSchema1773136015121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."images_genre_enum" AS ENUM('Nature', 'Architecture', 'Portrait', 'Uncategorized')`,
    );
    await queryRunner.query(
      `CREATE TABLE "images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying(255) NOT NULL, "originalPath" character varying(500) NOT NULL, "genre" "public"."images_genre_enum" NOT NULL DEFAULT 'Uncategorized', "rating" integer NOT NULL DEFAULT '3', "aspectRatio" double precision NOT NULL, "dominantColor" character varying(7) NOT NULL, "lqipBase64" text NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "images"`);
    await queryRunner.query(`DROP TYPE "public"."images_genre_enum"`);
  }
}
