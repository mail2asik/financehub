import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsDto } from './dto/contact-us.dto';

@Controller('contact')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitContactForm(@Body() dto: ContactUsDto) {
    return this.contactUsService.createSubmission(dto);
  }
}