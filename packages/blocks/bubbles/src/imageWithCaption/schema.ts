import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "zod";
import { BubbleBlockType } from "../constants";

export const imageWithCaptionBubbleContentSchema = z.object({
  url: z.string().optional(),
  caption: z.string().optional(),
});

export const imageWithCaptionBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.IMAGE_WITH_CAPTION]),
    content: imageWithCaptionBubbleContentSchema.optional(),
  }),
);

export type ImageWithCaptionBubbleBlock = z.infer<
  typeof imageWithCaptionBubbleBlockSchema
>;
