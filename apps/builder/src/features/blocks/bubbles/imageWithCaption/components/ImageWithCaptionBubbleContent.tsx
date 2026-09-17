import { useTranslate } from "@tolgee/react";
import type { ImageWithCaptionBubbleBlock } from "@typebot.io/blocks-bubbles/imageWithCaption/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { BubbleCaption } from "@/components/BubbleCaption";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";

type Props = {
  block: ImageWithCaptionBubbleBlock;
};

export const ImageWithCaptionBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  const variable = typebot
    ? findUniqueVariable(typebot?.variables)(block.content?.url)
    : null;
  return !block.content?.url ? (
    <p color={"gray.500"}>{t("clickToEdit")}</p>
  ) : variable ? (
    <p>
      Display <VariableTag variableName={variable.name} />
    </p>
  ) : (
    <div className="w-full flex flex-col gap-1">
      <img
        className={cx(
          "object-cover rounded-md pointer-events-none",
          block.content?.url.startsWith("data:image/svg")
            ? "max-h-[80px]"
            : undefined,
        )}
        src={block.content?.url}
        alt={block.content?.caption ?? "Group visual"}
      />
      {block.content?.caption && <BubbleCaption text={block.content.caption} />}
    </div>
  );
};
