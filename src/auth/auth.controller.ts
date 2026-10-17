import { Body, Controller, Get, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Tell TypeScript that the Request object will have a 'user' property
interface RequestWithUser extends ExpressRequest {
  user: any; 
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}