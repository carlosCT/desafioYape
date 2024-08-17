import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka, ClientProxy, RpcException } from '@nestjs/microservices';
import { ANTIFRAUD_SERVICE, TRANSACTION_SERVICE } from 'src/config';
import { CreateTransactionRequest } from '../dto/create-transaction-request.dto';
import { TransactionCreatedEvent } from 'src/transaction-created.event';
import { firstValueFrom } from 'rxjs';
import { TRANSACTION_STATUS } from 'src/constants/app.constant';

@Injectable()
export class AppService {
  constructor(
    @Inject(TRANSACTION_SERVICE) private readonly client: ClientKafka,
    @Inject(ANTIFRAUD_SERVICE) private readonly antifraudService: ClientProxy,
  ) {}

  async createTransaction(createTransactionRequest: CreateTransactionRequest) {
    const {
      accountExternalIdDebit,
      accountExternalIdCredit,
      tranferTypeId,
      AmountValue,
    } = createTransactionRequest;


    try {
      // this.client.emit(
      //   'transaction_created',
      //   new TransactionCreatedEvent(
      //     accountExternalIdDebit,
      //     accountExternalIdCredit,
      //     tranferTypeId,
      //     AmountValue,
      //     TRANSACTION_STATUS.PENDING.id
      //   ),
      // );
  
      const antifraudResponse= await firstValueFrom( this.antifraudService.send('validate-transaction', createTransactionRequest));
      console.log("antifraud response ", antifraudResponse);

      if(antifraudResponse.status){
        console.log('Process antifraud is ok, transaction is approved');


        this.client.emit(
          'transaction_updated',
          new TransactionCreatedEvent(
            accountExternalIdDebit,
            accountExternalIdCredit,
            tranferTypeId,
            AmountValue,
            TRANSACTION_STATUS.APPROVED.id
          ),
        );

        return {
          process: 'transaction_updated',
          status: TRANSACTION_STATUS.APPROVED.name,
        };
      }else{


        console.log('Process antifraud is not ok, transaction is rejeted');
        this.client.emit(
          'transaction_updated',
          new TransactionCreatedEvent(
            accountExternalIdDebit,
            accountExternalIdCredit,
            tranferTypeId,
            AmountValue,
            TRANSACTION_STATUS.REJECTED.id
          ),
        );
        return {
          process: 'transaction_updated',
          status: TRANSACTION_STATUS.REJECTED.name
        };
      }


    } catch (error) {
      throw new RpcException(error)
    }
   
  }
}
