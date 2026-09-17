import { uploadFileWithPresignedPostData } from "@typebot.io/lib/s3/uploadFileWithPresignedPostData";
import type { ButtonProps } from "@typebot.io/ui/components/Button";
import { UploadButton as UploadButtonPrimitive } from "@typebot.io/ui/components/UploadButton";
import { useRef } from "react";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { type CompressPreset, compressFile } from "@/helpers/compressFile";
import { orpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";

type UploadButtonProps = {
  fileType: "image" | "audio" | "video" | "file";
  filePathProps: FilePathUploadProps;
  onFileUploaded: (url: string, originalFilename?: string) => void;
  compressPreset?: CompressPreset;
} & ButtonProps;

export const UploadButton = ({
  fileType,
  filePathProps,
  onFileUploaded,
  compressPreset,
  children,
  variant,
  size = "sm",
}: UploadButtonProps) => {
  // The storage path is keyed by block ID, not the original filename (no
  // extension survives) — the primitive's onValueCommit only forwards the
  // resulting URL, so the original name is stashed here to pass through
  // once the upload resolves.
  const lastOriginalFilename = useRef<string | undefined>(undefined);

  const handleFileUploadRequest = async (rawFile: File) => {
    lastOriginalFilename.current = rawFile.name;
    const file = await compressFile(rawFile, compressPreset);
    const data = await orpc.generateUploadUrl.call({
      filePathProps,
      fileType: file.type,
    });
    const upload = await uploadFileWithPresignedPostData({
      presignedUrl: data.presignedUrl,
      formData: data.formData,
      file,
    });
    if (!upload.ok) {
      toast({
        description: "Error while trying to upload the file.",
      });
      return null;
    }
    return `${data.fileUrl}?v=${Date.now()}`;
  };

  return (
    <UploadButtonPrimitive
      accept={
        fileType === "image"
          ? "image/avif, image/png, image/jpeg, image/gif, image/webp, image/bmp, image/tiff"
          : fileType === "video"
            ? "video/*"
            : fileType === "file"
              ? "*/*"
              : "audio/*"
      }
      variant={variant}
      size={size}
      onFileUploadRequest={handleFileUploadRequest}
      onValueCommit={(url) => onFileUploaded(url, lastOriginalFilename.current)}
    >
      {children}
    </UploadButtonPrimitive>
  );
};
