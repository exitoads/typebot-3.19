import type { ImageWithCaptionBubbleBlock } from "@typebot.io/blocks-bubbles/imageWithCaption/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";

type Props = {
  uploadFileProps: FilePathUploadProps;
  block: ImageWithCaptionBubbleBlock;
  onContentChange: (content: ImageWithCaptionBubbleBlock["content"]) => void;
};

export const ImageWithCaptionBubbleSettings = ({
  uploadFileProps,
  block,
  onContentChange,
}: Props) => {
  const updateUrl = (url: string) => {
    onContentChange({ ...block.content, url });
  };

  const updateCaption = (caption: string) => {
    onContentChange({ ...block.content, caption });
  };

  return (
    <div className="flex flex-col gap-4">
      <ImageUploadContent
        uploadFileProps={uploadFileProps}
        defaultUrl={block.content?.url}
        onSubmit={updateUrl}
        additionalTabs={{
          giphy: true,
          unsplash: true,
          icon: true,
        }}
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
