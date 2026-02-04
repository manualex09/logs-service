import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

@Entity('log_files')
export class LogFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string; // "CAM001_2024-01-30.log"

  @Column()
  filePath: string; // "servidores/CAM001_2024-01-30.log"

  @Column()
  cameraId: string; // "CAM001" - Extraído del nombre del archivo

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}




