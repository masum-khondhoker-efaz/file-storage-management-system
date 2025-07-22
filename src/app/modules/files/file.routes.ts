import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { fileUploader } from '../../utils/fileUploader';
import { FileControllers } from './file.controller';
import { FileValidations } from './file.validation';
const router = express.Router();

router.get('/storage', auth(), FileControllers.getUserStorage);

router.get('/storage-summary', auth(), FileControllers.getStorageSummary);

router.post(
  '/upload',
  auth(),
  fileUploader.upload.single('file'),
  FileControllers.uploadFile,
);

router.get('/note-files', auth(), FileControllers.allNoteFiles);

router.get('/image-files', auth(), FileControllers.allImageFiles);

router.get('/pdf-files', auth(), FileControllers.allPdfFiles);

router.patch(
  '/favorite/:id',
  auth(),
  validateRequest(FileValidations.toggleFavorite),
  FileControllers.toggleFavorite,
);

router.patch(
  '/rename/:id',
  auth(),
  validateRequest(FileValidations.renameFile),
  FileControllers.renameFile,
);

router.post('/duplicate/:id', auth(), FileControllers.duplicateFile);

router.post('/copy/:id', auth(), FileControllers.duplicateFile);

router.delete('/:id', auth(), FileControllers.deleteFile);

router.get('/recent', auth(), FileControllers.getRecentFiles);

router.get(
  '/by-date',
  auth(),
  validateRequest(FileValidations.getByDate),
  FileControllers.getByDate,
);

router.patch(
  '/set-password/:id',
  auth(),
  validateRequest(FileValidations.setPassword),
  FileControllers.setPassword
);

router.post(
  '/verify-password/:id',
  auth(),
  validateRequest(FileValidations.verifyPassword),
  FileControllers.verifyPassword
);

router.get(
  '/private-content',
  auth(),
  FileControllers.getPrivateContent
);


export const FileRouters = router;
