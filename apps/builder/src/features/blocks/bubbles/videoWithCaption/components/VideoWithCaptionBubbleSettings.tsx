import type { VideoWithCaptionBubbleBlock } from "@typebot.io/blocks-bubbles/videoWithCaption/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { VideoUploadContent } from "@/features/blocks/bubbles/video/components/VideoUploadContent";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";

type Props = {
  uploadFileProps: FilePathUploadProps;
  block: VideoWithCaptionBubbleBlock;
  onContentChange: (content: VideoWithCaptionBubbleBlock["content"]) => void;
};

export const VideoWithCaptionBubbleSettings = ({
  uploadFileProps,
  block,
  onContentChange,
}: Props) => {
  const updateCaption = (caption: string) => {
    onContentChange({ ...block.content, caption });
  };

  return (
    <div className="flex flex-col gap-4">
      <VideoUploadContent
        content={block.content}
        onSubmit={onContentChange}
        uploadFileProps={uploadFileProps}
        includedTabs={["upload", "link", "pexels"]}
      />
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
