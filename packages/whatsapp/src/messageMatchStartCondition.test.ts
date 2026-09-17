import { ComparisonOperators } from "@typebot.io/conditions/constants";
import { describe, expect, it } from "vitest";
import { messageMatchStartCondition } from "./startWhatsAppSession";

describe("messageMatchStartCondition", () => {
  it("matches regex start conditions", () => {
    expect(
      messageMatchStartCondition(
        { type: "text", text: "entrega canva" },
        {
          comparisons: [
            {
              id: "1",
              comparisonOperator: ComparisonOperators.MATCHES_REGEX,
              value: "/^entrega\\s*can?va$/i",
            },
          ],
        },
      ),
    ).toBe(true);
  });

  it("does not match invalid regex patterns", () => {
    expect(
      messageMatchStartCondition(
        { type: "text", text: "entrega canva" },
        {
          comparisons: [
            {
              id: "1",
              comparisonOperator: ComparisonOperators.MATCHES_REGEX,
              value: "^(?i)entrega\\s\\*can?va$",
            },
          ],
        },
      ),
    ).toBe(false);
  });

  it("matches canva teste / canva test variations (separado ou junto)", () => {
    const condition = {
      comparisons: [
        {
          id: "1",
          comparisonOperator: ComparisonOperators.MATCHES_REGEX,
          value: "/^\\s*canva\\s*(teste|test)\\s*$/i",
        },
      ],
    };
    expect(
      messageMatchStartCondition(
        { type: "text", text: "canva teste" },
        condition,
      ),
    ).toBe(true);
    expect(
      messageMatchStartCondition(
        { type: "text", text: "canva test" },
        condition,
      ),
    ).toBe(true);
    expect(
      messageMatchStartCondition(
        { type: "text", text: "canvateste" },
        condition,
      ),
    ).toBe(true);
    expect(
      messageMatchStartCondition(
        { type: "text", text: "canvatest" },
        condition,
      ),
    ).toBe(true);
    expect(
      messageMatchStartCondition(
        { type: "text", text: "Canva Teste" },
        condition,
      ),
    ).toBe(true);
    expect(
      messageMatchStartCondition(
        { type: "text", text: "CANVA TEST" },
        condition,
      ),
    ).toBe(true);
    expect(
      messageMatchStartCondition(
        { type: "text", text: "  canva   teste  " },
        condition,
      ),
    ).toBe(true);
  });

  it("matches combined entrega canva + canva teste with OR logical operator", () => {
    const condition = {
      logicalOperator: "OR" as const,
      comparisons: [
        {
          id: "1",
          comparisonOperator: ComparisonOperators.MATCHES_REGEX,
          value: "/^\\s*entrega\\s*canva\\s*$/i",
        },
        {
          id: "2",
          comparisonOperator: ComparisonOperators.MATCHES_REGEX,
          value: "/^\\s*canva\\s*(teste|test)\\s*$/i",
        },
      ],
    };
    expect(
      messageMatchStartCondition(
        { type: "text", text: "entrega canva" },
        condition,
      ),
    ).toBe(true);
    expect(
      messageMatchStartCondition(
        { type: "text", text: "canva teste" },
        condition,
      ),
    ).toBe(true);
    expect(
      messageMatchStartCondition(
        { type: "text", text: "canvatest" },
        condition,
      ),
    ).toBe(true);
    expect(
      messageMatchStartCondition(
        { type: "text", text: "outra coisa" },
        condition,
      ),
    ).toBe(false);
  });

  it("does NOT match when regex pattern is missing /delimiters/flags (common mistake)", () => {
    const conditionWithoutDelimiters = {
      comparisons: [
        {
          id: "1",
          comparisonOperator: ComparisonOperators.MATCHES_REGEX,
          value: "^\\s*canva\\s*(teste|test)\\s*$",
        },
      ],
    };
    expect(
      messageMatchStartCondition(
        { type: "text", text: "Canva Teste" },
        conditionWithoutDelimiters,
      ),
    ).toBe(false);
  });
});
