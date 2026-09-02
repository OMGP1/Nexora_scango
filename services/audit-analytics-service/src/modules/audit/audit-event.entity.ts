import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_events')
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  session_id!: string;

  @Column()
  event_type!: string;

  @Column({ type: 'jsonb' })
  payload!: any;

  @CreateDateColumn()
  occurred_at!: Date;

  @Column()
  hash!: string;

  @Column({ nullable: true })
  previous_hash!: string;
}
