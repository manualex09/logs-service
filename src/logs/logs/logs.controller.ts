import { Controller,Get,Param,Query,Logger,Post,HttpCode,HttpStatus} from '@nestjs/common';
import { LogsService } from './logs.service.refactored';

@Controller('logs')
export class LogsController {
  private readonly logger = new Logger(LogsController.name);

  constructor(private readonly logsService: LogsService) {}

  /**
   * GET /logs/:cameraID
   * Obtener todos los logs de una cámara específica
   */
  @Get(':cameraID')
  async getLogsByCameraId(@Param('cameraID') cameraID: string) {
    this.logger.log(`GET /logs/${cameraID}`);
    const logs = await this.logsService.getLogsByCameraId(cameraID);
    
    return {
      cameraId: cameraID,
      total: logs.length,
      logs,
    };
  }

  /**
   * GET /logs/pending
   * Obtener logs pendientes (ERROR, WARN)
   */
  @Get('pending')
  async getPendingLogs() {
    this.logger.log('GET /logs/pending');
    const logs = await this.logsService.getPendingLogs();
    
    return {
      total: logs.length,
      logs,
    };
  }

  /**
   * GET /logs/range
   * Obtener logs en un rango de fechas
   * Query params: start, end, cameraId (opcional)
   */
  @Get('range')
  async getLogsByRange(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('cameraId') cameraId?: string,
  ) {
    this.logger.log(`GET /logs/range?start=${start}&end=${end}`);
    
    if (!start || !end) {
      return {
        error: 'Parámetros start y end son requeridos',
        example: '/logs/range?start=2024-01-01T00:00:00Z&end=2024-01-31T23:59:59Z'
      };
    }

    const logs = await this.logsService.getLogsByRange(start, end, cameraId);
    
    return {
      range: { start, end },
      cameraId: cameraId || 'all',
      total: logs.length,
      logs,
    };
  }

  /**
   * GET /logs/remote
   * Obtener logs remotos (todos los logs de todos los archivos)
   */
  @Get('remote')
  async getRemoteLogs() {
    this.logger.log('GET /logs/remote');
    const files = await this.logsService.listLogFiles();
    
    return {
      total: files.length,
      files: files.map(f => ({
        id: f.id,
        fileName: f.fileName,
        filePath: f.filePath,
        cameraId: f.cameraId,
        createdAt: f.createdAt,
      })),
    };
  }

  /**
   * GET /logs/server/:cameraID
   * Alias para /logs/:cameraID
   */
  @Get('server/:cameraID')
  async getServerLogs(@Param('cameraID') cameraID: string) {
    this.logger.log(`GET /logs/server/${cameraID}`);
    return this.getLogsByCameraId(cameraID);
  }

  /**
   * GET /logs/server-id/:id
   * Obtener logs por ID de servidor
   */
  @Get('server-id/:id')
  async getLogsByServerId(@Param('id') id: string) {
    this.logger.log(`GET /logs/server-id/${id}`);
    const logs = await this.logsService.getLogsByServerId(id);
    
    return {
      serverId: id,
      total: logs.length,
      logs,
    };
  }

  /**
   * GET /logs/servers
   * Listar todos los archivos de log registrados
   */
  @Get('servers')
  async listServers() {
    this.logger.log('GET /logs/servers');
    const files = await this.logsService.listLogFiles();
    
    return {
      total: files.length,
      servers: files.map(f => ({
        id: f.id,
        fileName: f.fileName,
        filePath: f.filePath,
        cameraId: f.cameraId,
        createdAt: f.createdAt,
      })),
    };
  }

  /**
   * POST /logs/sync
   * Sincronizar archivos físicos con la base de datos
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncFiles() {
    this.logger.log('POST /logs/sync');
    const result = await this.logsService.syncFiles();
    
    return {
      message: 'Sincronización completada',
      ...result,
    };
  }

  /**
   * GET /logs/file-info
   * Obtener información de un archivo específico
   * Query param: filePath
   */
  @Get('file-info')
  async getFileInfo(@Query('filePath') filePath: string) {
    this.logger.log(`GET /logs/file-info?filePath=${filePath}`);
    
    if (!filePath) {
      return {
        error: 'Parámetro filePath es requerido',
        example: '/logs/file-info?filePath=CAM001_2024-01-30.log'
      };
    }

    return this.logsService.getFileInfo(filePath);
  }
}