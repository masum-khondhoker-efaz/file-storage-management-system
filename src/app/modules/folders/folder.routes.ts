import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FolderValidations } from './folder.validation';
import { FolderControllers } from './folder.controller';


const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(FolderValidations.createFolderSchema),
  FolderControllers.createFolder,
);

router.get('/', auth(), FolderControllers.getAllFolders);

router.get('/:id', auth(), FolderControllers.getFolderById);

router.delete('/:id', auth(), FolderControllers.deleteFolder);

export const FolderRoutes = router;
