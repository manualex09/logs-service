import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 📌 ¿POR QUÉ ESTA ENTIDAD ES NECESARIA?
 * 
 * Tu código tiene DOS tipos de operaciones diferentes:
 * 
 * 1️⃣ LOGS INDIVIDUALES (cada evento que ocurre):
 *    - processLog() → guarda un mensaje de log
 *    - getPendingLogs() → obtiene logs sin procesar
 *    - markLogsAsProcessed() → marca logs como procesados
 * 
 * 2️⃣ CONFIGURACIÓN DE SERVIDORES (configuración de dónde leer logs):
 *    - addServerConfig() → registra un servidor y su ruta de logs
 *    - getServers() → lista todos los servidores configurados
 *    - getLogs() → lee el ARCHIVO físico de logs de un servidor
 * 
 * Son conceptos DIFERENTES que no deberían estar en la misma tabla.
 * 
 * EJEMPLO:
 * - ServerConfig: "El servidor CAM-001 tiene sus logs en /var/log/cam001.log"
 * - Log: "2025-01-28 14:30:15 - CAM-001 - ERROR - Conexión perdida"
 */

@Entity('server_config')
export class ServerConfig {
  @PrimaryGeneratedColumn()
  id: number;

  // Identificador único del servidor/cámara
  @Column({ unique: true })
  cameraID: string;

  // Nombre descriptivo del servidor
  @Column()
  serverName: string;

  // Ruta física al archivo de logs en el sistema
  @Column()
  logPath: string;

  // Si está habilitado para lectura
  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}