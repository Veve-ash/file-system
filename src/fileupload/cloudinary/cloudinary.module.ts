import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { CloudinaryProvider } from './cloudinary.config';

@Module({
  imports: [ConfigModule], 
  providers: [CloudinaryProvider],
  exports: ['Cloudinary'],
})
export class CloudinaryModule {}