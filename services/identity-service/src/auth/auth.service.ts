import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { JwtPayload, generateId } from '@scango/common';
import { LoginDto } from './dto/login.dto';
import { GuestSessionDto } from './dto/guest-session.dto';

@Injectable()
export class AuthService {
  constructor(@Inject('DB_POOL') private pool: Pool) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const result = await this.pool.query(
      'SELECT user_id, email, password_hash, name, role, store_id, is_active FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.user_id,
      type: 'staff',
      role: user.role,
      store_id: user.store_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'scango-dev-jwt-secret-change-in-production');

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          store_id: user.store_id,
        },
      },
    };
  }

  async createGuestSession(guestDto: GuestSessionDto) {
    const { store_id } = guestDto;
    
    // Validate store exists
    const storeRes = await this.pool.query('SELECT store_id FROM stores WHERE store_id = $1', [store_id]);
    if (storeRes.rowCount === 0) {
      throw new UnauthorizedException('Invalid store_id');
    }

    const guestId = generateId();

    const payload: JwtPayload = {
      sub: guestId,
      type: 'guest',
      store_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60, // 4 hours for guest session
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'scango-dev-jwt-secret-change-in-production');

    return {
      success: true,
      data: {
        token,
        guest_id: guestId,
        store_id,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'scango-dev-jwt-secret-change-in-production', { ignoreExpiration: true }) as JwtPayload;
      
      const newPayload = { ...payload };
      newPayload.iat = Math.floor(Date.now() / 1000);
      newPayload.exp = Math.floor(Date.now() / 1000) + (payload.type === 'guest' ? 4 * 60 * 60 : 24 * 60 * 60);

      const newToken = jwt.sign(newPayload, process.env.JWT_SECRET || 'scango-dev-jwt-secret-change-in-production');

      return {
        success: true,
        data: {
          token: newToken,
        },
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateToken(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'scango-dev-jwt-secret-change-in-production') as JwtPayload;
      return {
        success: true,
        data: payload,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
