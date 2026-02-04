import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as readline from 'readline';

export interface ParsedLog {
  timestamp: string;
  level: string;
  cameraId: string;
  message: string;
  raw?: string;
}

@Injectable()
export class FileReaderService {
  private readonly logger = new Logger(FileReaderService.name);
  private readonly baseLogsPath = path.join(process.cwd(), 'servidores');

  /**
   * Leer archivo completo y parsear logs
   * Formato esperado: [2024-01-30T15:30:00.000Z] INFO CAM001 - Camera started
   */
  async readLogFile(filePath: string): Promise<ParsedLog[]> {
    const fullPath = path.join(this.baseLogsPath, filePath);

    // Verificar que el archivo existe
    if (!await fs.pathExists(fullPath)) {
      throw new NotFoundException(`Archivo no encontrado: ${filePath}`);
    }

    const logs: ParsedLog[] = [];
    const fileStream = fs.createReadStream(fullPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (line.trim()) {
        const parsed = this.parseLogLine(line);
        if (parsed) {
          logs.push(parsed);
        }
      }
    }

    this.logger.log(`Leídos ${logs.length} logs de ${filePath}`);
    return logs;
  }

  /**
   * Parsear una línea de log
   * Formato: [2024-01-30T15:30:00.000Z] INFO CAM001 - Camera started
   */
  parseLogLine(line: string): ParsedLog | null {
    try {
      // Regex para parsear el formato: [timestamp] LEVEL CAMERAID - message
      const regex = /^\[(.*?)\]\s+(\w+)\s+(\w+)\s+-\s+(.+)$/;
      const match = line.match(regex);

      if (!match) {
        this.logger.warn(`No se pudo parsear la línea: ${line}`);
        return {
          timestamp: new Date().toISOString(),
          level: 'UNKNOWN',
          cameraId: 'UNKNOWN',
          message: line,
          raw: line
        };
      }

      const [, timestamp, level, cameraId, message] = match;

      return {
        timestamp,
        level: level.toUpperCase(),
        cameraId,
        message: message.trim(),
        raw: line
      };
    } catch (error) {
      this.logger.error(`Error parseando línea: ${line}`, error);
      return null;
    }
  }

  /**
   * Leer logs filtrados por rango de fechas
   */
  async readLogsByDateRange(
    filePath: string,
    startDate: string,
    endDate: string
  ): Promise<ParsedLog[]> {
    const allLogs = await this.readLogFile(filePath);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return allLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }

  /**
   * Listar todos los archivos .log en servidores/
   */
  async listLogFiles(): Promise<string[]> {
    try {
      await fs.ensureDir(this.baseLogsPath);
      const files = await fs.readdir(this.baseLogsPath);
      return files.filter(file => file.endsWith('.log') || file.endsWith('.txt'));
    } catch (error) {
      this.logger.error('Error listando archivos:', error);
      return [];
    }
  }

  /**
   * Buscar archivos por cameraId
   */
  async findFilesByCameraId(cameraId: string): Promise<string[]> {
    const allFiles = await this.listLogFiles();
    return allFiles.filter(file => file.includes(cameraId));
  }

  /**
   * Verificar si un archivo existe
   */
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.baseLogsPath, filePath);
    return fs.pathExists(fullPath);
  }

  /**
   * Obtener información del archivo
   */
  async getFileInfo(filePath: string) {
    const fullPath = path.join(this.baseLogsPath, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new NotFoundException(`Archivo no encontrado: ${filePath}`);
    }

    const stats = await fs.stat(fullPath);
    const logs = await this.readLogFile(filePath);

    return {
      fileName: path.basename(filePath),
      filePath,
      fileSize: stats.size,
      totalLogs: logs.length,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  }
}