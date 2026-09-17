import type { ConditionBlock } from "@typebot.io/blocks-logic/condition/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { ExecuteLogicResponse } from "../../../types";

export const executeConditionBlock = (
  block: ConditionBlock,
  { state, sessionStore }: { state: SessionState; sessionStore: SessionStore },
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot;

  console.log(
    "[BOT CONDITION BLOCK DEBUG] Bloco IF encontrado:",
    JSON.stringify({
      blockId: block.id,
      blockLabel: `condition:${block.id}`,
      itemsCount: block.items.length,
      availableVariables: variables
        .filter(
          (v) => v.value !== undefined && v.value !== null && v.value !== "",
        )
        .slice(0, 20)
        .map((v) => ({ id: v.id, name: v.name, value: v.value })),
    }),
  );

  const evaluatedItems: any[] = [];
  const passedCondition = block.items.find((item, idx) => {
    if (!item.content) {
      console.log(
        `[BOT CONDITION BLOCK DEBUG] item[${idx}] sem content (IF vazio, pulando`,
      );
      return false;
    }
    const result = executeCondition(item.content, { variables, sessionStore });
    evaluatedItems.push({
      index: idx,
      itemId: item.id,
      logicalOperator: item.content.logicalOperator ?? "AND",
      comparisons: (item.content.comparisons ?? []).map((c) => {
        const variable = variables.find((v) => v.id === c.variableId);
        return {
          variableId: c.variableId,
          variableName: variable?.name,
          variableValue: variable?.value,
          comparisonOperator: c.comparisonOperator,
          comparisonValue: c.value,
        };
      }),
      result,
    });
    console.log(
      `[BOT CONDITION BLOCK DEBUG] item[${idx}] IF${result ? " ✅ PASSOU" : " ❌ NÃO PASSOU"}:`,
      JSON.stringify(evaluatedItems[evaluatedItems.length - 1]),
    );
    return result;
  });

  const outgoingEdgeId = passedCondition
    ? (passedCondition.outgoingEdgeId ?? null)
    : block.outgoingEdgeId;

  console.log(
    "[BOT CONDITION BLOCK DEBUG] DECISÃO FINAL:",
    JSON.stringify({
      passedItemId: passedCondition?.id ?? "nenhum (caiu no ELSE)",
      outgoingEdgeId,
    }),
  );

  return { outgoingEdgeId };
};
