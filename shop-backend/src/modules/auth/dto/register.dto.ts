import { IsEmail, MinLength, IsNotEmpty, IsOptional } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  role!: 'ADMIN'

  @IsNotEmpty()
  phone?: string

  @IsOptional()
  @IsNotEmpty()
  businessId?: string;
}