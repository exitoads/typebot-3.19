import { useTranslate } from "@tolgee/react";
import {
  embedBaseUrls,
  VideoBubbleContentType,
} from "@typebot.io/blocks-bubbles/video/constants";
import type { VideoWithCaptionBubbleBlock } from "@typebot.io/blocks-bubbles/videoWithCaption/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { BubbleCaption } from "@/components/BubbleCaption";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";

type Props = {
  block: VideoWithCaptionBubbleBlock;
};

export const VideoWithCaptionBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  if (!block.content?.url || !block.content.type)
    return <p color="gray.500">{t("clickToEdit")}</p>;
  const variable = typebot
    ? findUniqueVariable(typebot?.variables)(block.content?.url)
    : null;

  const caption = block.content.caption && (
    <BubbleCaption text={block.content.caption} />
  );

  switch (block.content.type) {
    case VideoBubbleContentType.URL:
      return (
        <div className="w-full flex flex-col gap-1">
          <div
            className={cx(
              "w-full relative",
              variable ? undefined : "h-[120px]",
            )}
          >
            {variable ? (
              <p>
                Display <VariableTag variableName={variable.name} />
              </p>
            ) : (
              // Always show controls in this canvas thumbnail (independent
              // of areControlsDisplayed, which governs the live chat player)
              // so the video can actually be identified/played while editing.
              // biome-ignore lint/a11y/useMediaCaption: Captions are not available for configurable video sources in the builder preview.
              <video
                key={block.content.url}
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  left: "0",
                  top: "0",
                  borderRadius: "10px",
                }}
              >
                <source src={block.content.url} />
              </video>
            )}
          </div>
          {caption}
        </div>
      );
    case VideoBubbleContentType.GUMLET:
    case VideoBubbleContentType.VIMEO:
    case VideoBubbleContentType.YOUTUBE: {
      const baseUrl = embedBaseUrls[block.content.type];
      return (
        <div className="w-full flex flex-col gap-1">
          <div className="w-full h-[120px] relative">
            <iframe
              title="Video preview"
              src={`${baseUrl}/${block.content.id}`}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                left: "0",
                top: "0",
                borderRadius: "10px",
                pointerEvents: "none",
              }}
            />
          </div>
          {caption}
        </div>
      );
    }
    case VideoBubbleContentType.TIKTOK: {
      return (
        <div className="w-full flex flex-col gap-1">
          <div className="w-full h-[300px] relative">
            <iframe
              title="TikTok video preview"
              src={`https://www.tiktok.com/embed/v2/${block.content.id}`}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                left: "0",
                top: "0",
                borderRadius: "10px",
                pointerEvents: "none",
              }}
            />
          </div>
          {caption}
        </div>
      );
    }
  }
};
