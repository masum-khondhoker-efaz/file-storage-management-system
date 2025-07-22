import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { fileUploader } from '../../utils/fileUploader';
import sendResponse from '../../utils/sendResponse';
import { FileServices } from './file.service';

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const getFileType = (mimetype: string): 'note' | 'image' | 'pdf' => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (ALLOWED_IMAGE_MIME_TYPES.includes(mimetype)) return 'image';
  return 'note'; // Fallback for text/docs
};

const getUserStorage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await FileServices.getUserStorageFromDB(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User storage info retrieved successfully',
    data: result,
  });
});

const getStorageSummary = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await FileServices.getStorageSummaryFromDB(user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Storage summary retrieved',
    data: result,
  });
});

const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const file = req.file;

  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, 'File not found');
  }

  const fileUrl = file
    ? (await fileUploader.uploadToDigitalOcean(file)).Location
    : '';
  const fileType = getFileType(file.mimetype);
  console.log(`File type: ${fileType}`);

  const result = await FileServices.uploadFileToDB(
    user.id,
    fileUrl,
    file.size,
    fileType,
    file.originalname,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'File uploaded successfully',
    data: result,
  });
});

const allNoteFiles = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const files = await FileServices.getAllNotesFiles(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All note files retrieved successfully',
    data: files,
  });
});

const allImageFiles = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const files = await FileServices.getAllImageFiles(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All image files retrieved successfully',
    data: files,
  });
});

const allPdfFiles = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const files = await FileServices.getAllPdfFiles(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All PDF files retrieved successfully',
    data: files,
  });
});

const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
  const fileId = req.params.id;
  const user = req.user as any;
  const result = await FileServices.toggleFavorite(fileId, user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File favorite status toggled successfully',
    data: result,
  });
});

const renameFile = catchAsync(async (req: Request, res: Response) => {
  const fileId = req.params.id;
  const newName = req.body.fileName;
  const user = req.user as any;
  const result = await FileServices.renameFile(fileId, newName, user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File renamed successfully',
    data: result,
  });
});

const duplicateFile = catchAsync(async (req: Request, res: Response) => {
  const fileId = req.params.id;
  const user = req.user as any;
  const result = await FileServices.duplicateFile(fileId, user.id);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'File duplicated successfully',
    data: result,
  });
});

const deleteFile = catchAsync(async (req: Request, res: Response) => {
  const fileId = req.params.id;
  const user = req.user as any;
  await FileServices.deleteFile(fileId, user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File deleted successfully',
  });
});

const getRecentFiles = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const files = await FileServices.getRecentFiles(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Recent files retrieved successfully',
    data: files,
  });
});

const getByDate = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const { date } = req.query;

  const result = await FileServices.getByDateFromDB(user.id, date as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Files and folders retrieved by date',
    data: result,
  });
});

const setPassword = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password, resourceType } = req.body;
  const user = req.user as any;

  const result = await FileServices.setPasswordForResource(
    user.id,
    id,
    password,
    resourceType
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password set successfully',
    data: result,
  });
});

const verifyPassword = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password, resourceType } = req.body;
  const user = req.user as any;

  const { accessToken, resource } = await FileServices.verifyResourcePassword(
    user.id,
    id,
    password,
    resourceType
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password verified',
    data: { 
      accessGranted: true,
      accessToken, 
      expiresIn: 3600, 
      resourceType,
      resourceId: id
    }
  });
});

const getPrivateContent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const privateAccessToken = req.headers['x-private-access'] as string;

  if (!privateAccessToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Private access token required');
  }

  const result = await FileServices.getPrivateResources(user.id, privateAccessToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Private content retrieved',
    data: result,
  });
});

export const FileControllers = {
  getUserStorage,
  getStorageSummary,
  uploadFile,
  allNoteFiles,
  allImageFiles,
  allPdfFiles,
  toggleFavorite,
  renameFile,
  duplicateFile,
  deleteFile,
  getRecentFiles,
  getByDate,
  setPassword,
  verifyPassword,
  getPrivateContent
};
