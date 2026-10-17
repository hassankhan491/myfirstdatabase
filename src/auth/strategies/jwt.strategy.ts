import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'ecommerce-secret-key-2026', // Must match the secret in auth.module.ts
    });
  }

  async validate(payload: any) {
    // Find the user in the database using the ID from the token payload
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true, client: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    // This user object will be attached to the request object (req.user)
    return user;
  }
}   