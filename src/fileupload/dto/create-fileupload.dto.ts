import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";
import { Role } from "../enum/fileupload.role.enum"

export class CreateFileuploadDto {
   
    @IsNotEmpty()
    @IsString()
    firstName: string;
    
   
    @IsNotEmpty()
    @IsString()
    lastName: string;
    
   
    @IsNotEmpty()
    @IsEmail()
    Email: string;

   
    @IsNotEmpty()
    @IsString()
    Password: string;

    @IsOptional()
    role: Role;

}
