import { getFileFilename } from "@typebot.io/blocks-bubbles/file/helpers";
import type { FileBubbleBlock } from "@typebot.io/blocks-bubbles/file/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { createSignal, onCleanup, onMount } from "solid-js";
import { TypingBubble } from "../../../../../components/TypingBubble";

type Props = {
  content: FileBubbleBlock["content"];
  onTransitionEnd?: (ref?: HTMLDivElement) => void;
};

const showAnimationDuration = 400;
const typingDuration = 100;

let typingTimeout: NodeJS.Timeout;

export const FileBubble = (props: Props) => {
  let isPlayed = false;
  let ref: HTMLDivElement | undefined;
  const [isTyping, setIsTyping] = createSignal(!!props.onTransitionEnd);

  onMount(() => {
    typingTimeout = setTimeout(() => {
      if (isPlayed) return;
      isPlayed = true;
      setIsTyping(false);
      setTimeout(() => props.onTransitionEnd?.(ref), showAnimationDuration);
    }, typingDuration);
  });

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
  });

  const filename = () =>
    props.content?.filename ??
    (props.content?.url ? getFileFilename(props.content.url) : "File");

  return (
    <div
      class={cx(
        "flex flex-col",
        props.onTransitionEnd ? "animate-fade-in" : undefined,
      )}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div class="flex relative z-10 items-start typebot-host-bubble max-w-full">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing z-10 "
            style={{
              width: isTyping() ? "64px" : "100%",
              height: isTyping() ? "32px" : "100%",
            }}
          >
            {isTyping() ? <TypingBubble /> : null}
          </div>
          <div
            class={cx(
              "flex flex-col gap-1 z-10",
              isTyping() ? "opacity-0 h-8 @xs:h-9" : "opacity-100 p-4",
            )}
          >
            <a
              href={props.content?.url}
              target="_blank"
              rel="noreferrer"
              download={filename()}
              class="flex items-center gap-2 rounded-md border px-3 py-2 text-fade-in hover:opacity-80 min-w-0 max-w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="shrink-0"
              >
                <title>File</title>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span class="truncate text-sm min-w-0">{filename()}</span>
            </a>
            {props.content?.caption && (
              <p class="text-sm whitespace-pre-wrap">{props.content.caption}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
