type Props = {
  text: string;
};

// Mirrors how a caption reads on the live chat player and in a real Text
// bubble: each line as its own block, full text visible, no truncation.
export const BubbleCaption = ({ text }: Props) => (
  <div className="flex w-full min-w-0 flex-col text-sm">
    {text.split("\n").map((line, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: order is stable for a static caption string
      <div key={index} className="min-w-0 break-words">
        {line || " "}
      </div>
    ))}
  </div>
);
