import { IfThenStatement } from "./conditions";
import { Expression, getExpToString, SpecialExpression } from "./oprations";

export class CaseStatement extends SpecialExpression {
  constructor(
    private ifThens: IfThenStatement[],
    private elseResult: Expression
  ) {
    super();
  }

  toString(): string {
    const ifThenString = this.ifThens
      .map((ifThen) => ifThen.toString())
      .join("\n");

    return `(CASE ${ifThenString} ELSE ${getExpToString(this.elseResult)} END)`;
  }
}

export const caseWhen = (
  ifThens: IfThenStatement[],
  elseResult: Expression
) => {
  return new CaseStatement(ifThens, elseResult);
};
