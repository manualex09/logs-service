import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 const morgan = require('morgan');
  app.use(morgan('dev'))

   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // lanza error si envían propiedades extra
      transform: true, // transforma automáticamente tipos (string a number, etc.)
    }),
  );
  
 const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  console.log(`Aplicación corriendo en http://localhost:${PORT}`);
}
bootstrap();
