import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';
import { firstValueFrom } from 'rxjs';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('KAFKA')
    private readonly kafka: ClientProxy,
  ) {}

  @MessagePattern('message.created')
  public messageCreate(@Payload() payload: any) {
    Logger.log(payload, AppController.name);
  }

  @Post('/send')
  public sendMessage(
    @Body('message') message: string,
    @Body('user') user: string,
  ) {
    return firstValueFrom(this.kafka.emit('message.created', {
      message,
      user,
    }))
  }
}
