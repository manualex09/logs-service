import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export class Log {
  @IsString()
  @IsNotEmpty()
  cameraID: string;  // 👈 Mayúscula (como lo envía el cliente)

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsEnum(LogLevel)
  level: LogLevel;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;  // 👈 NUEVO: Acepta metadata
}