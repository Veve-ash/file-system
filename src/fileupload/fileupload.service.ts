import { BadRequestException, ConflictException, HttpException, Injectable, NotFoundException, Res, UnauthorizedException, OnModuleInit, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { Upload } from './schemas/file.schema';

@Injectable()
export class FileuploadService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  // Admin data array (replace with your actual admins)
  private readonly adminUsers = [
    {
      email: 'admin@example.com',
      password: 'SecurePass123!',
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin',
      isActive: true
    },
    // Add more admins if needed
  ];

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    @InjectModel(Upload.name)
    private uploadModel: Model<Upload>,
  ) {}



  async onModuleInit() {
    await this.seedAdminUsers();
  }

  private async seedAdminUsers() {
    try {
      for (const adminData of this.adminUsers) {
        const existingAdmin = await this.userModel.findOne({ 
          email: adminData.email 
        }).exec();

        if (!existingAdmin) {
          const hashedPassword = await argon2.hash(adminData.password);
          await this.userModel.create({
            ...adminData,
            password: hashedPassword
          });
          this.logger.log(`✅ Admin user ${adminData.email} seeded successfully`);
        } else {
          this.logger.log(`ℹ Admin user ${adminData.email} already exists`);
        }
      }
    } catch (error) {
      this.logger.error('❌ Failed to seed admin users', error.stack);
    }
  }


  async create(payload: CreateUserDto, file?: Express.Multer.File) {
    try {
      // Validate required fields
      if (!payload.email || !payload.password) {
        throw new BadRequestException('Email and password are required.');
      }
  
      const existingUser = await this.userModel.findOne({ email: payload.email });
      if (existingUser) {
        throw new ConflictException('Email already exists, login or input a new email address');
      }
  
      const { email, password, ...rest } = payload;
  
      // Hash the password
      const hashPassword = await argon2.hash(password);
  
      const userDetails = await this.userModel.create({
        email,
        password: hashPassword,
        ...rest,
      });
      console.log('Uploaded file:', file);
  
      // If a profile picture is provided, upload it
      if (file) {
        try {
          const profilePictureUrl = await this.uploadProfilePicture(file, userDetails.id);
          userDetails.profilePictureUrl = profilePictureUrl;
  
          // Save the updated user details
          await userDetails.save();
          console.log('Profile picture URL saved:', profilePictureUrl);
        } catch (error) {
          console.error('Error uploading profile picture:', error.message);
          throw new BadRequestException('Failed to upload profile picture.');
        }
      }
  
      const userPayload = { id: userDetails.id, email: userDetails.email, profilePictureUrl: userDetails.profilePictureUrl };
      return {
        userId: userDetails.id,
        userEmail: userDetails.email,
        profilePictureUrl: userDetails.profilePictureUrl || null,
        access_token: await this.jwtService.signAsync(userPayload),
      };
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  }

  async findEmail(email: string) {
    const mail = await this.userModel.findOne({ email })
    if (!mail) {
      throw new UnauthorizedException()
    }
    return mail;
  }

  async updateProfilePicture(file: Express.Multer.File, headers: any): Promise<any> {
    const user = await this.user(headers);
    const profilePictureUrl = await this.uploadProfilePicture(file, user.id);

    return {
      message: 'Profile picture updated successfully',
      profilePictureUrl,
    };
  }


 
    async signIn(payload: LoginDto) {
      const { email, password } = payload;
      const user = await this.userModel.findOne({ email }).select('+password');
  
      if (!user) {
        throw new HttpException('No email found', 400);
      }
  
      const checkedPassword = await this.verifyPassword(user.password, password);
      if (!checkedPassword) {
        throw new HttpException('Password is incorrect!', 400);
      }
  
      const token = await this.jwtService.signAsync({
        email: user.email,
        id: user.id,
        role: user.role,
      });
  
      return {
        success: true,
        userToken: token,
      };
    }

  async verifyPassword(hashedPassword: string, plainPassword: string,): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (err) {
      console.log(err.message)
      return false;
    }
  }


  async user(headers: any): Promise<any> {
    const authorizationHeader = headers.authorization;
    if (!authorizationHeader) {
      throw new UnauthorizedException('Invalid or missing Bearer token');
    }
  
    const token = authorizationHeader.replace('Bearer ', '');
    try {
      const decoded = this.jwtService.verify(token); // No need to manually pass secret if configured properly
      const id = decoded["id"];
  
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      return {
        id: user._id,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl || null,
        role: user.role
      
      };
       } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  
  findAll() {
    const findAll = this.userModel.find();
  }

  async findOne(id: string) {
    const user = await this.userModel.find()

    const findUserById = await this.userModel.findOne({ id });
    if (!findUserById) {
      throw new HttpException('User not found', 404);
    }

    return findUserById;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }


  async blockUser(id:string): Promise<{message:string}>{
    const user = await this.userModel.findOne({where : { id }});
    if(!user){ 
      throw new NotFoundException('User not found')
    };

    user.isBlocked = true;
    await user.save();
    return {message: `user with ID ${id} has been blocked`};
   }

   async unBlockUser(id:string): Promise<{message:string}>{
    const user = await this.userModel.findOne({where : { id }});
    if(!user){ 
      throw new NotFoundException('User not found')
    };

    user.isBlocked = false;
    await user.save();
    return {message: `user with ID ${id} has been unblocked`};
   }

  async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG and PNG are allowed.');
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }

    return new Promise(async (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(new BadRequestException('File upload failed.'));
          }

          if (!result) {
            return reject(new BadRequestException('Cloudinary did not return a result.'));
          }

          try {
            const user = await this.userModel.findById(userId);
            if (!user) {
              throw new NotFoundException('User not found');
            }

            // Update the user's profile picture URL
            user.profilePictureUrl = result.secure_url;
            await user.save();

            resolve(result.secure_url);
          } catch (dbError) {
            console.error('Database Save Error:', dbError);
            reject(new BadRequestException('Database save failed.'));
          }
        },
      );

      const fileStream = Readable.from(file.buffer);
      fileStream.pipe(uploadStream);
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
