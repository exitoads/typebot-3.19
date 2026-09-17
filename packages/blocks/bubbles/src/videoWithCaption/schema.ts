import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { singleVariableOrNumberSchema } from "@typebot.io/variables/schemas";
import { z } from "zod";
import { BubbleBlockType } from "../constants";
import { VideoBubbleContentType } from "../video/constants";

export const videoWithCaptionBubbleContentSchema = z.object({
  url: z.string().optional(),
  id: z.string().optional(),
  type: z.nativeEnum(VideoBubbleContentType).optional(),
  height: singleVariableOrNumberSchema.optional(),
  aspectRatio: z.string().optional(),
  maxWidth: z.string().optional(),
  queryParamsStr: z.string().optional(),
  areControlsDisplayed: z.boolean().optional(),
  isAutoplayEnabled: z.boolean().optional(),
  caption: z.string().optional(),
});

export const videoWithCaptionBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.VIDEO_WITH_CAPTION]),
    content: videoWithCaptionBubbleContentSchema.optional(),
  }),
);

export type VideoWithCaptionBubbleBlock = z.infer<
  typeof videoWithCaptionBubbleBlockSchema
>;
