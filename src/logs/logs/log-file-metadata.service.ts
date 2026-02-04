import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogFile } from '../../entities/log-file.entity';
import { FileReaderService } from './file-reader.service';

@Injectable()
export class LogFileMetadataService {
  private readonly logger = new Logger(LogFileMetadataService.name);

  constructor(
    @InjectRepository(LogFile)
    private readonly logFileRepository: Repository<LogFile>,
    private readonly fileReaderService: FileReaderService,
  ) {}

  /**
   * Registrar un archivo de log en la base de datos
   */
  async registerLogFile(fileName: string, filePath: string): Promise<LogFile> {
    // Extraer cameraId del nombre del archivo
    const cameraId = this.extractCameraId(fileName);

    const logFile = this.logFileRepository.create({
      fileName,
      filePath,
      cameraId,
    });

    const saved = await this.logFileRepository.save(logFile);
    this.logger.log(`Archivo registrado: ${fileName}`);
    return saved;
  }

  /**
   * Extraer cameraId del nombre del archivo
   * Ejemplo: "CAM001_2024-01-30.log" -> "CAM001"
   */
  private extractCameraId(fileName: string): string {
    const match = fileName.match(/^([A-Z0-9]+)/);
    return match ? match[1] : 'UNKNOWN';
  }

  /**
   * Buscar archivos por cameraId
   */
  async findByCameraId(cameraId: string): Promise<LogFile[]> {
    return this.logFileRepository.find({
      where: { cameraId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Listar todos los archivos registrados
   */
  async findAll(): Promise<LogFile[]> {
    return this.logFileRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar archivo por ruta
   */
  async findByPath(filePath: string): Promise<LogFile | null> {
    return this.logFileRepository.findOne({
      where: { filePath },
    });
  }

  /**
   * Sincronizar archivos físicos con la base de datos
   * Lee los archivos en servidores/ y registra los que no estén en BD
   */
  async syncFilesWithDatabase(): Promise<{ registered: number; skipped: number }> {
    const physicalFiles = await this.fileReaderService.listLogFiles();
    let registered = 0;
    let skipped = 0;

    for (const fileName of physicalFiles) {
      const filePath = fileName; // Asumiendo que están en la raíz de servidores/
      const existing = await this.findByPath(filePath);

      if (!existing) {
        await this.registerLogFile(fileName, filePath);
        registered++;
      } else {
        skipped++;
      }
    }

    this.logger.log(`Sincronización completa: ${registered} registrados, ${skipped} omitidos`);
    return { registered, skipped };
  }

  /**
   * Eliminar registro de un archivo (no elimina el archivo físico)
   */
  async deleteMetadata(id: number): Promise<void> {
    await this.logFileRepository.delete(id);
    this.logger.log(`Metadata eliminada: ID ${id}`);
  }
}