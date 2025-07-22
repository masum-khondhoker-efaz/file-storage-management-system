import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createFolderInDB = async (userId: string, payload: { folderName: string }) => {
  const folder = await prisma.folder.create({
    data: {
      folderName: payload.folderName,
      userId,
    },
    select: {
      id: true,
      folderName: true,
      createdAt: true,
    },
  });
  return folder;
};

const getAllFoldersFromDB = async (userId: string) => {
  const folders = await prisma.folder.findMany({
    where: { userId, isPrivate: false },
    select: {
      id: true,
      folderName: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
    return folders;
};

const getFolderByIdFromDB = async (userId: string, folderId: string) => {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId, isPrivate: false },
    select: {
      id: true,
      folderName: true,
      createdAt: true,
    },
  });
  return folder;
};

const deleteFolderFromDB = async (userId: string, folderId: string) => {
  // Step 1: Delete all files in the folder (cascade) + calculate total deleted size
  const files = await prisma.file.findMany({
    where: { folderId, userId },
    select: { size: true },
  });

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  // Step 2: Delete folder
  await prisma.$transaction([
    prisma.file.deleteMany({ where: { folderId, userId } }),
    prisma.folder.delete({ where: { id: folderId, userId } }),
  ]);

  // Step 3: Update user's usedStorage
  if (totalSize > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { usedStorage: { decrement: totalSize } },
    });
  }
};

export const FolderServices = {
  createFolderInDB,
  getAllFoldersFromDB,
  getFolderByIdFromDB,
  deleteFolderFromDB,
};
