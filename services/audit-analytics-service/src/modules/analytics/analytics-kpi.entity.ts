import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('analytics_kpis')
export class AnalyticsKpi {
  @PrimaryColumn({ type: 'date' })
  date!: Date;

  @PrimaryColumn()
  store_id!: string;

  @Column({ default: 0 })
  sessions_started!: number;

  @Column({ default: 0 })
  sessions_completed!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenue_total!: number;

  @Column({ default: 0 })
  verification_holds!: number;
}
