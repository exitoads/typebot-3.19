import { VideoBubbleContentType } from "@typebot.io/blocks-bubbles/video/constants";
import { parseVideoUrl } from "@typebot.io/blocks-bubbles/video/helpers";
import type { VideoBubbleBlock } from "@typebot.io/blocks-bubbles/video/schema";
import { Button } from "@typebot.io/ui/components/Button";
import { useState } from "react";
import { UploadButton } from "@/components/ImageUploadContent/UploadButton";
import { PexelsPicker } from "@/components/VideoUploadContent/PexelsPicker";
import { VideoLinkEmbedContent } from "@/components/VideoUploadContent/VideoLinkEmbedContent";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";

type Tabs = "upload" | "link" | "pexels";

type Props = {
  content?: VideoBubbleBlock["content"];
  onSubmit: (content: VideoBubbleBlock["content"]) => void;
  initialTab?: Tabs;
  uploadFileProps?: FilePathUploadProps;
} & (
  | {
      includedTabs?: Tabs[];
    }
  | {
      excludedTabs?: Tabs[];
    }
);

const allTabs: Tabs[] = ["upload", "link", "pexels"];
const defaultDisplayedTabs: Tabs[] = ["link", "pexels"];

export const VideoUploadContent = ({
  content,
  onSubmit,
  initialTab,
  uploadFileProps,
  ...props
}: Props) => {
  const includedTabs =
    "includedTabs" in props
      ? (props.includedTabs ?? defaultDisplayedTabs)
      : defaultDisplayedTabs;
  const excludedTabs =
    "excludedTabs" in props ? (props.excludedTabs ?? []) : [];
  const displayedTabs = allTabs.filter(
    (tab) => !excludedTabs.includes(tab) && includedTabs.includes(tab),
  );

  const [currentTab, setCurrentTab] = useState<Tabs>(
    initialTab ?? displayedTabs[0],
  );

  const updateUrl = (url: string) => {
    const {
      type,
      url: matchedUrl,
      id,
      videoSizeSuggestion,
    } = parseVideoUrl(url);
    if (currentTab !== "link") {
      // Allow user to update video settings after selection
      setCurrentTab("link");
    }
    return onSubmit({
      ...content,
      type,
      url: matchedUrl,
      id,
      ...(!content?.aspectRatio && !content?.maxWidth
        ? videoSizeSuggestion
        : {}),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {displayedTabs.includes("upload") && (
          <Button
            variant={currentTab === "upload" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("upload")}
            size="sm"
          >
            Upload
          </Button>
        )}
        {displayedTabs.includes("link") && (
          <Button
            variant={currentTab === "link" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("link")}
            size="sm"
          >
            Link
          </Button>
        )}
        {displayedTabs.includes("pexels") && (
          <Button
            variant={currentTab === "pexels" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("pexels")}
            size="sm"
          >
            Pexels
          </Button>
        )}
      </div>
      {/* Body content to be displayed below conditionally based on currentTab */}
      {currentTab === "upload" && uploadFileProps && (
        <div className="flex justify-center py-2">
          <UploadButton
            fileType="video"
            filePathProps={uploadFileProps}
            onFileUploaded={(url) =>
              onSubmit({
                ...content,
                type: VideoBubbleContentType.URL,
                url,
                id: undefined,
              })
            }
          >
            Choose a file
          </UploadButton>
        </div>
      )}
      {currentTab === "link" && (
        <VideoLinkEmbedContent
          content={content}
          updateUrl={updateUrl}
          onSubmit={onSubmit}
        />
      )}
      {currentTab === "pexels" && <PexelsPicker onVideoSelect={updateUrl} />}
    </div>
  );
};
