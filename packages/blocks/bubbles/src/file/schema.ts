import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "zod";
import { BubbleBlockType } from "../constants";

export const fileBubbleContentSchema = z.object({
  url: z.string().optional(),
  // The upload storage path is keyed by block ID, not the original filename
  // (no extension survives), so the real name is captured client-side at
  // upload time and stored here for display, type detection, and the
  // filename WhatsApp/other channels show for the document.
  filename: z.string().optional(),
  caption: z.string().optional(),
});

export const fileBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.FILE]),
    content: fileBubbleContentSchema.optional(),
  }),
);

export type FileBubbleBlock = z.infer<typeof fileBubbleBlockSchema>;
