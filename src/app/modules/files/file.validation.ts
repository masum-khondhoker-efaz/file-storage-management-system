import z from "zod";

const toggleFavorite = z.object({
  body: z.object({
  isFavorite: z.boolean(),
  }),
});

const renameFile = z.object({
  body: z.object({
    fileName: z.string().min(1, 'Filename is required'),
  }),
});

const getByDate = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  }),
});

const setPassword = z.object({
  body: z.object({
    password: z.string().length(4).regex(/^\d{4}$/, 'Must be 4-digit PIN'),
    resourceType: z.enum(['file', 'folder']),
  }),
});

const verifyPassword = z.object({
  body: z.object({
    password: z.string().length(4),
    resourceType: z.enum(['file', 'folder']),
  }),
});

export const FileValidations = {
  toggleFavorite,
  renameFile,
  getByDate,
  setPassword,
  verifyPassword,
};