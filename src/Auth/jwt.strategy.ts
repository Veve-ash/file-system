import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FileuploadService } from '../fileupload/fileupload.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
  constructor(private  fileuploadService: FileuploadService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:process.env.JWTSECRET,
      passReqToCallback: true,
    });
  }

  async validate(payload: { id: string; email: string }): Promise<Partial<User>> {
    const user = await this.fileuploadService.findOne(payload.id);
    if (!user) {
      throw new UnauthorizedException('Login first to access this endpoint');
    }

    return {
      _id: user._id,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
    };
  }
}


