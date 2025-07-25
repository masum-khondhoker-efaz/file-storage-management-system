import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../errors/AppError';
import prisma from '../utils/prisma';
import { verifyToken } from '../utils/verifyToken';

const auth = (...roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifyUserToken = verifyToken(
        token,
        config.jwt.access_secret as Secret,
      );

      // Check user is exist
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: verifyUserToken.id,
        },
      });

      // Check user is logged in
      if (!user.isLoggedIn) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not logged in!');
      }

      req.user = verifyUserToken;
      if (roles.length && !roles.includes(verifyUserToken.role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Forbidden!');
      }

      if (verifyUserToken.purpose === 'private-access') {
        req.user = verifyUserToken;
        return next();
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
