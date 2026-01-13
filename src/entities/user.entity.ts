import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class server {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}

