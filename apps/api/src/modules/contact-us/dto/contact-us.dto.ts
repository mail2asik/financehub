import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ContactUsDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(100)
  fullName!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(200)
  subject!: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message!: string;
}