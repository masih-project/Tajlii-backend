import { Request, Response, NextFunction } from 'express';
import * as moment from 'moment';
import * as crypto from 'crypto';
export function CookieMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req?.cookies?.session_id) {
    const session_id = crypto.randomBytes(16).toString('base64');
    const expired_date = moment().add('1', 'years').format();
    res.cookie('session_id', session_id, {
      // httpOnly: true,
      // secure: true]
      sameSite: 'strict',
      httpOnly: true,
      expires: new Date(expired_date),
    });
  }
  next();
}
