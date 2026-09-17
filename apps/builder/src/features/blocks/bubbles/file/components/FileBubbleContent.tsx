import { useTranslate } from "@tolgee/react";
import {
  getFileCategory,
  getFileExtension,
  getFileFilename,
} from "@typebot.io/blocks-bubbles/file/helpers";
import type { FileBubbleBlock } from "@typebot.io/blocks-bubbles/file/schema";
import { Download01Icon } from "@typebot.io/ui/icons/Download01Icon";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { useEffect, useState } from "react";
import { BubbleCaption } from "@/components/BubbleCaption";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";

type Props = {
  block: FileBubbleBlock;
};

const categoryBadgeClassName: Record<string, string> = {
  text: "bg-gray-4 text-gray-11",
  word: "bg-blue-4 text-blue-11",
  excel: "bg-green-4 text-green-11",
  powerpoint: "bg-orange-4 text-orange-11",
  other: "bg-gray-4 text-gray-11",
};

const maxPreviewChars = 300;

const useTextPreview = (url: string | undefined, enabled: boolean) => {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    setPreview(null);
    if (!enabled || !url) return;
    let cancelled = false;
    fetch(url)
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (cancelled || text == null) return;
        setPreview(
          text.length > maxPreviewChars
            ? `${text.slice(0, maxPreviewChars)}…`
            : text,
        );
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url, enabled]);
  return preview;
};

export const FileBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  const url = block.content?.url;
  const variable = typebot ? findUniqueVariable(typebot?.variables)(url) : null;

  const displayName = url
    ? (block.content?.filename ?? getFileFilename(url))
    : "";
  const extension = getFileExtension(displayName);
  const category = getFileCategory(extension);
  const isTextFile = category === "text";
  const preview = useTextPreview(url, isTextFile && !variable);

  if (!url) return <p color="gray.500">{t("clickToEdit")}</p>;

  if (variable)
    return (
      <p>
        Display <VariableTag variableName={variable.name} />
      </p>
    );

  return (
    <div className="w-full min-w-0 flex flex-col gap-1">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        download={displayName}
        onClick={(e) => e.stopPropagation()}
        className="w-full min-w-0 flex items-center gap-2 rounded-md border p-2 hover:bg-gray-2"
      >
        <span
          className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${categoryBadgeClassName[category]}`}
        >
          {extension ? extension.toUpperCase() : "FILE"}
        </span>
        <p className="min-w-0 flex-1 text-sm truncate">{displayName}</p>
        <Download01Icon className="shrink-0 size-4 text-gray-500" />
      </a>
      {isTextFile && preview && (
        <pre className="min-w-0 text-xs bg-gray-1 border rounded-md p-2 whitespace-pre-wrap break-words max-h-24 overflow-hidden">
          {preview}
        </pre>
      )}
      {block.content?.caption && <BubbleCaption text={block.content.caption} />}
    </div>
  );
};
