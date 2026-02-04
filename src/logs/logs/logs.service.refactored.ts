import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FileReaderService, ParsedLog } from './services/file-reader.service';
import { LogFileMetadataService } from './services/log-file-metadata.service';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(
    private readonly fileReaderService: FileReaderService,
    private readonly metadataService: LogFileMetadataService,
  ) {}

  /**
   * Obtener logs de una cámara específica
   * Busca todos los archivos de esa cámara y devuelve los logs
   */
  async getLogsByCameraId(cameraId: string): Promise<ParsedLog[]> {
    this.logger.log(`Buscando logs para cámara: ${cameraId}`);
    
    // Buscar archivos de esta cámara en la BD
    const files = await this.metadataService.findByCameraId(cameraId);
    
    if (files.length === 0) {
      throw new NotFoundException(`No se encontraron archivos para la cámara ${cameraId}`);
    }

    // Leer logs de todos los archivos de esta cámara
    const allLogs: ParsedLog[] = [];
    
    for (const file of files) {
      try {
        const logs = await this.fileReaderService.readLogFile(file.filePath);
        allLogs.push(...logs);
      } catch (error) {
        this.logger.error(`Error leyendo archivo ${file.filePath}:`, error);
      }
    }

    // Ordenar por timestamp descendente
    allLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return allLogs;
  }

  /**
   * Obtener logs en un rango de fechas
   */
  async getLogsByRange(
    startDate: string,
    endDate: string,
    cameraId?: string
  ): Promise<ParsedLog[]> {
    this.logger.log(`Buscando logs entre ${startDate} y ${endDate}`);

    let files;
    
    if (cameraId) {
      files = await this.metadataService.findByCameraId(cameraId);
    } else {
      files = await this.metadataService.findAll();
    }

    const allLogs: ParsedLog[] = [];

    for (const file of files) {
      try {
        const logs = await this.fileReaderService.readLogsByDateRange(
          file.filePath,
          startDate,
          endDate
        );
        allLogs.push(...logs);
      } catch (error) {
        this.logger.error(`Error leyendo archivo ${file.filePath}:`, error);
      }
    }

    allLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return allLogs;
  }

  /**
   * Obtener logs pendientes de procesar
   * Devuelve logs que tienen level ERROR o WARN
   */
  async getPendingLogs(): Promise<ParsedLog[]> {
    const files = await this.metadataService.findAll();
    const allLogs: ParsedLog[] = [];

    for (const file of files) {
      try {
        const logs = await this.fileReaderService.readLogFile(file.filePath);
        const pending = logs.filter(log => 
          log.level === 'ERROR' || log.level === 'WARN' || log.level === 'WARNING'
        );
        allLogs.push(...pending);
      } catch (error) {
        this.logger.error(`Error leyendo archivo ${file.filePath}:`, error);
      }
    }

    return allLogs;
  }

  /**
   * Listar todos los archivos registrados
   */
  async listLogFiles() {
    return this.metadataService.findAll();
  }

  /**
   * Obtener información de un archivo específico
   */
  async getFileInfo(filePath: string) {
    const metadata = await this.metadataService.findByPath(filePath);
    const fileInfo = await this.fileReaderService.getFileInfo(filePath);
    
    return {
      ...fileInfo,
      metadata,
    };
  }

  /**
   * Sincronizar archivos físicos con la base de datos
   */
  async syncFiles() {
    return this.metadataService.syncFilesWithDatabase();
  }

  /**
   * Obtener logs de un servidor específico (alias para cameraId)
   */
  async getLogsByServerId(serverId: string): Promise<ParsedLog[]> {
    return this.getLogsByCameraId(serverId);
  }
}