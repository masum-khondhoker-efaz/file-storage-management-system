import * as bcrypt from 'bcrypt';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { privateAccessToken } from '../../utils/generateToken';
import prisma from '../../utils/prisma';
import { verifyToken } from '../../utils/verifyToken';

const getUserStorageFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      storageLimit: true,
      usedStorage: true,
    },
  });

  return {
    storageLimit: user.storageLimit,
    usedStorage: user.usedStorage,
    remainingStorage: user.storageLimit - user.usedStorage,
  };
};

const uploadFileToDB = async (
  userId: string,
  fileUrl: string,
  sizeInBytes: number,
  type: string,
  fileName: string,
) => {
  const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { storageLimit: true, usedStorage: true, status: true },
  });

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  if (user.status !== 'ACTIVE')
    throw new AppError(httpStatus.FORBIDDEN, 'User is inactive');
  if (user.usedStorage + sizeInGB > user.storageLimit) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Storage quota exceeded');
  }

  const [file] = await prisma.$transaction([
    prisma.file.create({
      data: {
        userId,
        fileUrl,
        size: sizeInGB,
        type,
        fileName,
      },
      select: {
        id: true,
        fileName: true,
        type: true,
        size: true,
        fileUrl: true,
        createdAt: true,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { usedStorage: { increment: sizeInGB } },
    }),
  ]);

  return file;
};

const getAllNotesFiles = async (userId: string) => {
  const files = await prisma.file.findMany({
    where: { userId, type: 'note', isPrivate: false },
    select: {
      id: true,
      fileName: true,
      type: true,
      size: true,
      fileUrl: true,
      createdAt: true,
    },
  });
  return files;
};

const getAllImageFiles = async (userId: string) => {
  const files = await prisma.file.findMany({
    where: { userId, type: 'image', isPrivate: false },
    select: {
      id: true,
      fileName: true,
      type: true,
      size: true,
      fileUrl: true,
      createdAt: true,
    },
  });
  return files;
};

const getAllPdfFiles = async (userId: string) => {
  const files = await prisma.file.findMany({
    where: { userId, type: 'pdf', isPrivate: false },
    select: {
      id: true,
      fileName: true,
      type: true,
      size: true,
      fileUrl: true,
      createdAt: true,
    },
  });
  return files;
};

const toggleFavorite = async (fileId: string, userId: string) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) throw new AppError(httpStatus.NOT_FOUND, 'File not found');

  if (file.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to toggle favorite status',
    );
  }

  const updatedFile = await prisma.file.update({
    where: { id: fileId },
    data: { isFavorite: !file.isFavorite },
  });

  return updatedFile;
};

const renameFile = async (
  fileId: string,
  newFileName: string,
  userId: string,
) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) throw new AppError(httpStatus.NOT_FOUND, 'File not found');

  if (file.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to rename this file',
    );
  }

  const updatedFile = await prisma.file.update({
    where: { id: fileId },
    data: { fileName: newFileName },
  });

  return updatedFile;
};

const duplicateFile = async (fileId: string, userId: string) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) throw new AppError(httpStatus.NOT_FOUND, 'File not found');

  if (file.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to duplicate this file',
    );
  }

  const duplicatedFile = await prisma.file.create({
    data: {
      userId,
      fileUrl: file.fileUrl,
      size: file.size,
      type: file.type,
      fileName: `${file.fileName} - Copy`,
    },
  });

  return duplicatedFile;
};

const deleteFile = async (fileId: string, userId: string) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) throw new AppError(httpStatus.NOT_FOUND, 'File not found');

  if (file.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to delete this file',
    );
  }

  await prisma.file.delete({
    where: { id: fileId },
  });

  return { message: 'File deleted successfully' };
};

const getRecentFiles = async (userId: string) => {
  const files = await prisma.file.findMany({
    where: { userId, isPrivate: false },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      fileName: true,
      type: true,
      size: true,
      fileUrl: true,
      createdAt: true,
    },
  });
  return files;
};

const getByDateFromDB = async (userId: string, dateString: string) => {
  // Create start and end of day in UTC
  const date = new Date(dateString);
  const startOfDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const endOfDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
  );

  const [files, folders] = await Promise.all([
    prisma.file.findMany({
      where: {
        userId,
        isPrivate: false,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      select: {
        id: true,
        fileName: true,
        type: true,
        size: true,
        createdAt: true,
        isFavorite: true,
      },
    }),
    prisma.folder.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      select: {
        id: true,
        folderName: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    date: dateString,
    files,
    folders,
  };
};

const getStorageSummaryFromDB = async (userId: string) => {
  const [user, folderCount, fileStats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { storageLimit: true, usedStorage: true },
    }),
    prisma.folder.count({ where: { userId } }),
    prisma.file.groupBy({
      by: ['type'],
      where: { userId },
      _count: { id: true },
      _sum: { size: true },
    }),
  ]);

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  // Formatting function for 2 decimal places
  const formatSize = (size: number) => parseFloat(size.toFixed(2));

  const fileTypeStats = {
    notes: { count: 0, size: 0 },
    images: { count: 0, size: 0 },
    pdfs: { count: 0, size: 0 },
  };

  fileStats.forEach(stat => {
    const type = stat.type as 'note' | 'image' | 'pdf';
    const key = type === 'note' ? 'notes' : `${type}s`;
    fileTypeStats[key].count = stat._count.id;
    fileTypeStats[key].size = `${formatSize(stat._sum.size || 0)}GB`;
  });

  return {
    storage: {
      total: `${formatSize(user.storageLimit)}GB`,
      used: `${formatSize(user.usedStorage)}GB`,
      remaining: `${formatSize(user.storageLimit - user.usedStorage)}GB`,
      // percentageUsed: parseFloat(((user.usedStorage / user.storageLimit) * 100).toFixed(1)),
    },
    folders: {
      total: folderCount,
    },
    files: fileTypeStats,
    // lastUpdated: new Date().toISOString(),
  };
};

const setPasswordForResource = async (
  userId: string,
  resourceId: string,
  password: string,
  resourceType: 'file' | 'folder',
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const updateData = {
    isPrivate: true,
    password: hashedPassword,
  };

  if (resourceType === 'file') {
    return await prisma.file.update({
      where: { id: resourceId, userId },
      data: updateData,
    });
  } else {
    return await prisma.folder.update({
      where: { id: resourceId, userId },
      data: updateData,
    });
  }
};

const verifyResourcePassword = async (
  userId: string,
  resourceId: string,
  password: string,
  resourceType: 'file' | 'folder',
) => {
  const resource =
    resourceType === 'file'
      ? await prisma.file.findFirst({ where: { id: resourceId, userId } })
      : await prisma.folder.findFirst({ where: { id: resourceId, userId } });

  if (!resource) throw new AppError(httpStatus.NOT_FOUND, 'Resource not found');
  if (!resource.isPrivate)
    throw new AppError(httpStatus.BAD_REQUEST, 'Resource is not private');
  if (!resource.password)
    throw new AppError(httpStatus.BAD_REQUEST, 'No password set');

  const isMatch = await bcrypt.compare(password, resource.password);
  if (!isMatch)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect password');

  const accessToken = await privateAccessToken(
    {
      resourceId,
      resourceType,
      userId,
      purpose: 'private-access',
    },
    config.jwt.private_access_secret as Secret,
    config.jwt.private_access_expires_in as string,
  );

  if (!accessToken) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to generate access token',
    );
  }

  const { password: resourcePassword, ...resourceWithoutPassword } = resource;
  return {
    accessToken,
    resource: resourceWithoutPassword,
  };
};

const getPrivateResources = async (userId: string, accessToken?: string) => {
  if (!accessToken)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Access denied');

  try {
    const decoded = verifyToken(
      accessToken,
      config.jwt.private_access_secret as Secret,
    );

    if (decoded.userId !== userId)
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Access denied to this resource',
      );

    if (decoded.resourceType === 'file') {
      return await prisma.file.findUnique({
        where: { id: decoded.resourceId, userId: decoded.userId },
      });
    } else {
      return await prisma.folder.findUnique({
        where: { id: decoded.resourceId, userId: decoded.userId },
      });
    }
  } catch {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid access token');
  }
};

export const FileServices = {
  getUserStorageFromDB,
  uploadFileToDB,
  getAllNotesFiles,
  getAllImageFiles,
  getAllPdfFiles,
  toggleFavorite,
  renameFile,
  duplicateFile,
  deleteFile,
  getRecentFiles,
  getByDateFromDB,
  getStorageSummaryFromDB,
  setPasswordForResource,
  verifyResourcePassword,
  getPrivateResources,
};
