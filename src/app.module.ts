import { Module } from '@nestjs/common';
import { FileuploadModule } from './fileupload/fileupload.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  }), 
   MongooseModule.forRootAsync({
    imports:[ConfigModule],
    inject:[ConfigService],
    useFactory: async(configService:ConfigService) => ({
      uri:configService.get<string>('DB_URI'),
    }),
  }),
    FileuploadModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
