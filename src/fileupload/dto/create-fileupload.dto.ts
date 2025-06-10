import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateFileuploadDto {
    @ApiProperty({example : "Redmi", description: "Name of Product"})
    @IsNotEmpty()
    @IsString()
    firstName: string;
    
    @ApiProperty({description: "efficient battery"})
    @IsNotEmpty()
    @IsString()
    lastName: string;
    
    @ApiProperty({example : 40000, description: "price of Product"})
    @IsNotEmpty()
    @IsEmail()
    Email: string;

    @ApiProperty({example : 40000, description: "price of Product"})
    @IsNotEmpty()
    @IsString()
    Password: string;

}
