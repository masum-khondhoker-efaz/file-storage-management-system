import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FolderServices } from './folder.service';

const createFolder = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await FolderServices.createFolderInDB(user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Folder created successfully',
    data: result,
  });
});

const getAllFolders = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await FolderServices.getAllFoldersFromDB(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Folders retrieved successfully',
    data: result,
  });
});

const getFolderById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const folderId = req.params.id;
  const folder = await FolderServices.getFolderByIdFromDB(user.id, folderId);
 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Folder retrieved successfully',
    data: folder,
  });
});

const deleteFolder = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  await FolderServices.deleteFolderFromDB(user.id, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Folder deleted successfully',
    data: null,
  });
});

export const FolderControllers = {
  createFolder,
  getAllFolders,
  getFolderById,
  deleteFolder,
};
