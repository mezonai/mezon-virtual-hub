import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDiamondToUser1747195054406 implements MigrationInterface {
    name = "AddDiamondToUser1747195054406";

     public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
          'user',
          new TableColumn({
            name: 'diamond',
            type: 'int',
            default: 0
          }),
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('user', 'diamond');
      }

}
