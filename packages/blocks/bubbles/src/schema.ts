import { z } from "zod";
import { audioBubbleBlockSchema } from "./audio/schema";
import { embedBubbleBlockSchema } from "./embed/schema";
import { fileBubbleBlockSchema } from "./file/schema";
import { imageBubbleBlockSchema } from "./image/schema";
import { imageWithCaptionBubbleBlockSchema } from "./imageWithCaption/schema";
import { textBubbleBlockSchema } from "./text/schema";
import { videoBubbleBlockSchema } from "./video/schema";
import { videoWithCaptionBubbleBlockSchema } from "./videoWithCaption/schema";

export const bubbleBlockSchema = z.discriminatedUnion("type", [
  textBubbleBlockSchema,
  imageBubbleBlockSchema,
  imageWithCaptionBubbleBlockSchema,
  videoBubbleBlockSchema,
  videoWithCaptionBubbleBlockSchema,
  fileBubbleBlockSchema,
  embedBubbleBlockSchema,
  audioBubbleBlockSchema,
]);
export type BubbleBlock = z.infer<typeof bubbleBlockSchema>;

export type BubbleBlockContent = BubbleBlock["content"];
