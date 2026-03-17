const { z } = require("zod");

const documentFolderSchema = z
  .string()
  .trim()
  .min(1, "Le dossier est obligatoire")
  .max(255, "Le chemin du dossier est trop long")
  .transform((value) =>
    value
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .join("/")
  )
  .refine(
    (value) =>
      value.split("/").every((segment) => /^[\p{L}\p{N}_ -]+$/u.test(segment)),
    "Le nom du dossier contient des caractères non autorisés"
  );

const createDocumentSchema = z.object({
  title: z.string().trim().max(150).optional().or(z.literal("")),
  folder_path: documentFolderSchema,
  note: z.string().trim().max(3000).optional().or(z.literal("")),
});

module.exports = {
  createDocumentSchema,
};