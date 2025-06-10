import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Headers, UseGuards, UseInterceptors, UploadedFile, Res,Request, BadRequestException } from '@nestjs/common';
import { FileuploadService } from './fileupload.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto';
import { Role } from './enum/user.role.enum';
import { Roles } from './guard/role';
import { RolesGuard } from './guard/role.guard';

@Controller('user')
export class FileuploadController {

  constructor(private readonly fileuploadService: FileuploadService
  ) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('file')) // Allow profile picture upload during signup
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {

    console.log('File received in controller:', file);

    if (!file) {
      console.warn('No file received in the request.');
    }
    return this.fileploadService.create(createUserDto, file);
  }


    @Post('signin')
  signIn(@Body() LoginDto: LoginDto, ) {
    return this.fileploadService.signIn(LoginDto);
  }

  @Get('getall')
  @UseGuards(AuthGuard() )
 findAll() {
  return this.fileuploadService.findAll();
}

@Put(':id')
@UseGuards(AuthGuard(), RolesGuard)
@Roles(Role.Admin)
update(@Param('id') id: string,  updateUserDto: UpdateUserDto) {
  return this.fileuploadService.update(id, updateUserDto);
}

  @UseGuards(AuthGuard()) // Ensure this guard is applied to protect the endpoint
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Ensure this matches the form-data key
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Headers() headers: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file received. Please upload a valid file.');
    }

    try {
      return await this.fileuploadService.updateProfilePicture(file, headers);
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }


  @Patch(':id/block')
@UseGuards(AuthGuard(), RolesGuard )
@Roles(Role.Admin)
async blockUser(@Param('id') id: string) {
  return this.fileuploadService.blockUser(id);
}

@Patch(':id/unblock')
@Roles(Role.Admin)
async unblockUser(@Param('id') id: string) {
  return this.fileuploadService.unBlockUser(id);
}


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileuploadService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileuploadService.remove(+id);
  }
}
