import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { CreateTransactionRequest } from '../dto/create-transaction-request.dto';

@Controller('transaction')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  createTransaction(@Body() createTransactionRequest: CreateTransactionRequest) {

    console.log(createTransactionRequest);
    return this.appService.createTransaction(createTransactionRequest);
  }
}
