import { handleSqlValue, SqlValue } from "./utils";

export abstract class SpecialExpression {
  abstract toString(): string;
}

export type Expression = SqlValue | SpecialExpression;

export const getExpToString = (exp: Expression) => {
  if (exp instanceof SpecialExpression) {
    return exp.toString();
  }
  return handleSqlValue(exp);
};

class Operation extends SpecialExpression {
  constructor(
    private expA: Expression,
    private operator: string,
    private expB: Expression,
    private castToFloat: boolean
  ) {
    super();
  }

  public toString(): string {
    const expA = getExpToString(this.expA);
    const expB = getExpToString(this.expB);
    return `(${expA} ${this.operator} ${
      this.castToFloat ? `CAST(${expB} AS FLOAT)` : expB
    })`;
  }
}

export const op = (
  expA: Expression,
  operator: string,
  expB: Expression,
  castToFloat: boolean = false
) => {
  return new Operation(expA, operator, expB, castToFloat);
};

class FunctionCall extends SpecialExpression {
  constructor(private name: string, private argList: Expression[]) {
    super();
  }

  public toString(): string {
    return `${this.name}(${this.argList
      .map((arg) => getExpToString(arg))
      .join(", ")})`;
  }
}

export const replace = (
  fullString: Expression,
  pattern: Expression,
  replacement: Expression
) => {
  return new FunctionCall("REPLACE", [fullString, pattern, replacement]);
};

export const concat = (...expList: Expression[]) => {
  return new FunctionCall("CONCAT", expList);
};
