import express from 'express';
import { AuthRouters } from '../modules/Auth/auth.routes';
import { FileRouters } from '../modules/files/file.routes';
import { FolderRoutes } from '../modules/folders/folder.routes';
import { UserRouters } from '../modules/User/user.routes';
const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  {
    path: '/files',
    route: FileRouters,
  },
  {
    path: '/folders',
    route: FolderRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
