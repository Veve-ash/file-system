import { Module } from '@nestjs/common';
import { FileuploadService } from 'fileupload.service'
import { FileuploadController } from './fileupload.controller';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv'
import { JwtStrategy } from '../Auth/jwt.strategy';
import { CloudinaryModule } from 'src/cloudinary/coudinary.module';
import { uploadSchema } from './schemas/file.schema';
import { SeedService } from './seed.service';

dotenv.config()

@Module({
    
  imports: [
    CloudinaryModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },{ name: 'Upload', schema: uploadSchema }],),

      JwtModule.register({
    global:true,
    secret:process.env.JWTSECRET,
    signOptions:{expiresIn:'1h'}

  }),
  PassportModule.register({
    defaultStrategy:'jwt',
    session:true
  }),
  
  ],
  controllers: [FileuploadController],
providers: [FileuploadService,JwtStrategy
],

  exports: [FileuploadService, JwtModule, PassportModule, MongooseModule],
})
export class UserModule { }
