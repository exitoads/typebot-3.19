export type FileCategory = "text" | "word" | "excel" | "powerpoint" | "other";

const textExtensions = new Set(["txt", "md", "env", "yaml", "yml"]);
const wordExtensions = new Set(["doc", "docx"]);
const excelExtensions = new Set(["xls", "xlsx"]);
const powerpointExtensions = new Set(["ppt", "pptx"]);

export const getFileExtension = (url: string): string => {
  const filename = url.split("/").pop()?.split("?")[0] ?? "";
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return filename.slice(lastDotIndex + 1).toLowerCase();
};

export const getFileFilename = (url: string): string =>
  url.split("/").pop()?.split("?")[0] ?? url;

export const getFileCategory = (extension: string): FileCategory => {
  if (textExtensions.has(extension)) return "text";
  if (wordExtensions.has(extension)) return "word";
  if (excelExtensions.has(extension)) return "excel";
  if (powerpointExtensions.has(extension)) return "powerpoint";
  return "other";
};
