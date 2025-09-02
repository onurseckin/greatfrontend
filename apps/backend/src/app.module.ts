import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { FilesModule } from './modules/files/files.module';
import { ProjectModule } from './modules/project/project.module';
import { TransformModule } from './modules/transform/transform.module';

@Module({
  imports: [DatabaseModule, ProjectModule, FilesModule, TransformModule],
})
export class AppModule {}
