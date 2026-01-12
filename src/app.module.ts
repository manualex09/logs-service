import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogsModule } from './logs/logs/logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
    type:'sqlite',
    database:'database.db',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize:true,
    }),
    LogsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService  ],
})
export class AppModule {}
