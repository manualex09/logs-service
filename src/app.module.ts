import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogsModule } from './logs/logs/logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { serverModule } from './server/users.module'; 
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects:5,
      proxy:false,
    }),
    TypeOrmModule.forRoot({
    type:'sqlite',
    database:'database.db',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize:true,
    }),
    LogsModule,
    serverModule,
  ],
  controllers: [AppController],
  providers: [AppService  ],
})
export class AppModule {}
