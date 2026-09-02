import { Controller, Post, Param, Sse, MessageEvent } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs';
import Redis from 'ioredis';

@Controller('api/v1/sessions')
export class NotificationController {
  private redisSub: Redis;

  constructor(private readonly notificationService: NotificationService) {
    this.redisSub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  @Sse(':id/notifications/stream')
  streamNotifications(@Param('id') sessionId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const channel = `notifications:${sessionId}`;
      
      // Subscribe to Redis channel for this session
      this.redisSub.subscribe(channel, (err) => {
        if (err) {
          subscriber.error(err);
        }
      });

      this.redisSub.on('message', (ch, message) => {
        if (ch === channel) {
          subscriber.next({ data: JSON.parse(message) });
        }
      });

      // Cleanup when client disconnects
      return () => {
        this.redisSub.unsubscribe(channel);
      };
    });
  }

  @Post(':id/help')
  async requestHelp(@Param('id') sessionId: string) {
    await this.notificationService.requestHelp(sessionId);
    return { success: true };
  }
}
