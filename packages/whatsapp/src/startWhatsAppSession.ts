import { startSession } from "@typebot.io/bot-engine/startSession";
import type {
  ContinueChatResponse,
  Message,
} from "@typebot.io/chat-api/schemas";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import { SessionStore } from "@typebot.io/runtime-session-store";
import { defaultSessionExpiryTimeout } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import type { WhatsAppMessageReferral } from "./schemas";
import { WhatsAppError } from "./WhatsAppError";

type Props = {
  incomingMessage?: Message;
  workspaceId: string;
  credentials: WhatsAppCredentials["data"] & Pick<WhatsAppCredentials, "id">;
  contact: NonNullable<SessionState["whatsApp"]>["contact"];
  referral?: WhatsAppMessageReferral;
  sessionStore: SessionStore;
};

export const startWhatsAppSession = async ({
  incomingMessage,
  workspaceId,
  credentials,
  contact,
  referral,
  sessionStore,
}: Props): Promise<
  ContinueChatResponse & {
    newSessionState: SessionState;
    visitedEdges: Prisma.VisitedEdge[];
    setVariableHistory: SetVariableHistoryItem[];
  }
> => {
  const publicTypebotsWithWhatsAppEnabled =
    (await prisma.publicTypebot.findMany({
      where: {
        typebot: { workspaceId, whatsAppCredentialsId: credentials.id },
      },
      select: {
        settings: true,
        typebot: {
          select: {
            publicId: true,
          },
        },
      },
    })) as (Pick<PublicTypebot, "settings"> & {
      typebot: Pick<Typebot, "publicId">;
    })[];

  const botsWithWhatsAppEnabled = publicTypebotsWithWhatsAppEnabled.filter(
    (publicTypebot) =>
      publicTypebot.typebot.publicId &&
      publicTypebot.settings.whatsApp?.isEnabled,
  );

  const incomingMessageText =
    incomingMessage?.type === "text" ? incomingMessage.text : "";
  console.log(
    "[WHATSAPP DEBUG] startWhatsAppSession - incomingMessage:",
    JSON.stringify({
      type: incomingMessage?.type ?? "none",
      text: incomingMessageText,
      textBytes: Array.from(incomingMessageText).map((c) =>
        c.charCodeAt(0).toString(16).padStart(4, "0"),
      ),
    }),
  );
  console.log(
    "[WHATSAPP DEBUG] bots with WhatsApp enabled (total):",
    botsWithWhatsAppEnabled.length,
  );

  let matchedBotIndex = -1;
  const publicTypebotWithMatchedCondition = botsWithWhatsAppEnabled.find(
    (publicTypebot, index) => {
      const hasCondition =
        (publicTypebot.settings.whatsApp?.startCondition?.comparisons.length ??
          0) > 0;
      if (!hasCondition) {
        console.log(
          `[WHATSAPP DEBUG] bot[${index}] publicId=${publicTypebot.typebot.publicId} - sem startCondition, pulando`,
        );
        return false;
      }
      const startCondition = publicTypebot.settings.whatsApp?.startCondition;
      const matchResult = messageMatchStartCondition(
        incomingMessage ?? { type: "text", text: "" },
        startCondition,
      );
      console.log(
        `[WHATSAPP DEBUG] bot[${index}] publicId=${publicTypebot.typebot.publicId} - logicalOperator=${startCondition?.logicalOperator ?? "AND (default)"} comparisons=${JSON.stringify(startCondition?.comparisons)} matchResult=${matchResult}`,
      );
      if (matchResult) matchedBotIndex = index;
      return matchResult;
    },
  );

  const fallbackBot = botsWithWhatsAppEnabled.find(
    (publicTypebot) => !publicTypebot.settings.whatsApp?.startCondition,
  );

  console.log(
    "[WHATSAPP DEBUG] RESULTADO FINAL:",
    JSON.stringify({
      matchedBotWithCondition: publicTypebotWithMatchedCondition
        ? {
            publicId: publicTypebotWithMatchedCondition.typebot.publicId,
            index: matchedBotIndex,
          }
        : null,
      fallbackBotWithoutCondition: fallbackBot?.typebot.publicId ?? null,
      selectedBot:
        (publicTypebotWithMatchedCondition ?? fallbackBot)?.typebot.publicId ??
        null,
    }),
  );

  const publicTypebot = publicTypebotWithMatchedCondition ?? fallbackBot;

  if (isNotDefined(publicTypebot)) {
    if (botsWithWhatsAppEnabled.length > 0)
      throw new WhatsAppError("Message did not matched any condition");
    throw new WhatsAppError(
      "No public typebot with WhatsApp integration found",
    );
  }

  const sessionExpiryTimeoutHours =
    publicTypebot.settings.whatsApp?.sessionExpiryTimeout ??
    defaultSessionExpiryTimeout;

  return startSession({
    version: 2,
    startParams: {
      type: "live",
      publicId: publicTypebot.typebot.publicId as string,
      isOnlyRegistering: false,
      isStreamEnabled: false,
      textBubbleContentFormat: "richText",
      message: incomingMessage,
    },
    initialSessionState: {
      whatsApp: {
        contact,
        referral: referral
          ? {
              sourceId: referral.source_id,
              ctwaClickId: referral.ctwa_clid,
            }
          : undefined,
      },
      expiryTimeout: sessionExpiryTimeoutHours * 60 * 60 * 1000,
    },
    sessionStore,
  });
};

const whatsAppIncomingMessageVariableId = "whatsapp-incoming-message";

export const messageMatchStartCondition = (
  message: Message | undefined,
  startCondition: NonNullable<Settings["whatsApp"]>["startCondition"],
  sessionStore: SessionStore = new SessionStore(),
) => {
  if (!startCondition) {
    console.log(
      "[WHATSAPP DEBUG] messageMatchStartCondition: startCondition é null/undefined -> true",
    );
    return true;
  }
  if (message?.type !== "text" || !message.text) {
    console.log(
      "[WHATSAPP DEBUG] messageMatchStartCondition: mensagem NÃO é texto -> false",
    );
    return false;
  }
  if (startCondition.comparisons.length === 0) {
    console.log(
      "[WHATSAPP DEBUG] messageMatchStartCondition: 0 comparações -> false",
    );
    return false;
  }

  console.log(
    "[WHATSAPP DEBUG] messageMatchStartCondition - executando executeCondition:",
    JSON.stringify({
      messageText: message.text,
      messageBytes: Array.from(message.text).map((c) =>
        c.charCodeAt(0).toString(16).padStart(4, "0"),
      ),
      logicalOperator: startCondition.logicalOperator ?? "AND (default)",
      comparisons: startCondition.comparisons,
    }),
  );

  const result = executeCondition(
    {
      logicalOperator: startCondition.logicalOperator,
      comparisons: startCondition.comparisons.map((comparison) => ({
        ...comparison,
        variableId: whatsAppIncomingMessageVariableId,
      })),
    },
    {
      variables: [
        {
          id: whatsAppIncomingMessageVariableId,
          name: "WhatsApp message",
          value: message.text,
        },
      ],
      sessionStore,
    },
  );

  console.log(
    "[WHATSAPP DEBUG] messageMatchStartCondition - RESULTADO executeCondition:",
    result,
  );
  return result;
};
