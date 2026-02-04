import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './file-reader.service';
import { LogsController } from './logs.controller';
import { log_config } from './logs_config.entity';
import { HttpModule } from '@nestjs/axios';
import { Log } from './dto/create-log.dto';
import { ServerConfig } from '../server-config.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([log_config,ServerConfig])
    ,HttpModule // 👈 esto registra el repositorio
  ],
  providers: [LogsService],
  controllers: [LogsController],
  exports: [LogsService],
})
export class LogsModule {}
