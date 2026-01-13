import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { server } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([server])],
})
export class serverModule {}
