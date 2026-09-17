import type { FileBubbleBlock } from "@typebot.io/blocks-bubbles/file/schema";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { useState } from "react";
import { UploadButton } from "@/components/ImageUploadContent/UploadButton";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";

type Props = {
  uploadFileProps: FilePathUploadProps;
  block: FileBubbleBlock;
  onContentChange: (content: FileBubbleBlock["content"]) => void;
};

export const FileBubbleSettings = ({
  uploadFileProps,
  block,
  onContentChange,
}: Props) => {
  const [currentTab, setCurrentTab] = useState<"upload" | "link">("upload");

  const updateUploadedFile = (url: string, originalFilename?: string) =>
    onContentChange({ ...block.content, url, filename: originalFilename });
  const updateLinkUrl = (url: string) =>
    onContentChange({ ...block.content, url, filename: undefined });
  const updateCaption = (caption: string) =>
    onContentChange({ ...block.content, caption });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={currentTab === "upload" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("upload")}
            size="sm"
          >
            Upload
          </Button>
          <Button
            variant={currentTab === "link" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("link")}
            size="sm"
          >
            Link
          </Button>
        </div>
        {currentTab === "upload" && (
          <div className="flex flex-col items-center gap-1 py-2">
            <UploadButton
              fileType="file"
              filePathProps={uploadFileProps}
              onFileUploaded={updateUploadedFile}
            >
              Choose a file
            </UploadButton>
            {block.content?.filename && (
              <p className="text-xs text-gray-500 truncate max-w-full">
                {block.content.filename}
              </p>
            )}
          </div>
        )}
        {currentTab === "link" && (
          <DebouncedTextInputWithVariablesButton
            placeholder="Paste the file link..."
            onValueChange={updateLinkUrl}
            defaultValue={block.content?.url}
          />
        )}
      </div>
      <Field.Root>
        <Field.Label>Caption</Field.Label>
        <DebouncedTextareaWithVariablesButton
          placeholder="Type your caption..."
          onValueChange={updateCaption}
          defaultValue={block.content?.caption}
        />
      </Field.Root>
    </div>
  );
};
