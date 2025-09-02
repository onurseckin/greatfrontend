import { Module } from '@nestjs/common';
import { ProjectDirectController } from './project-direct.controller';

@Module({
  controllers: [ProjectDirectController],
})
export class ProjectModule {}
