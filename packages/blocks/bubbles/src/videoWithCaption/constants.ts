import { defaultVideoBubbleContent } from "../video/constants";
import type { VideoWithCaptionBubbleBlock } from "./schema";

export const defaultVideoWithCaptionBubbleContent =
  defaultVideoBubbleContent satisfies VideoWithCaptionBubbleBlock["content"];
