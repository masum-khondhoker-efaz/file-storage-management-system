import { z } from 'zod';

const createFolderSchema = z.object({
  body: z.object({
    folderName: z.string().min(1, 'Folder name is required'),
  }),
});

export const FolderValidations = {
  createFolderSchema,
};
