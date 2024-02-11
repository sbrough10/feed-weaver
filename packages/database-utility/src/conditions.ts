import _ from "lodash";
import { Expression, getExpToString } from "./oprations";
import { f, SqlValue, TableField, TableValues } from "./utils";

export class IfThenStatement {
  constructor(private condition: Condition, private result: Expression) {}

  toString(): string {
    return `WHEN ${this.condition.toString()} THEN ${getExpToString(
      this.result
    )}`;
  }
}

export abstract class Condition {
  public and(that: Condition): Condition {
    return new AndCondition(this, that);
  }

  public or(that: Condition): Condition {
    return new OrCondition(this, that);
  }

  public then(result: Expression): IfThenStatement {
    return new IfThenStatement(this, result);
  }

  public abstract toString(): string;
}

class ConjunctionCondition extends Condition {
  constructor(private conjunction: string, private conditions: Condition[]) {
    super();
  }

  public toString(): string {
    if (this.conditions.length === 0) {
      return "";
    }
    return `(${this.conditions
      .map((cond) => cond.toString())
      .join(` ${this.conjunction} `)})`;
  }
}

class AndCondition extends ConjunctionCondition {
  constructor(...conditions: Condition[]) {
    super("AND", conditions);
  }
}

class OrCondition extends ConjunctionCondition {
  constructor(...conditions: Condition[]) {
    super("OR", conditions);
  }
}

class UnarySuffixOperatorCondition extends Condition {
  constructor(private exp: Expression, private operator: string) {
    super();
  }

  public toString(): string {
    const exp = getExpToString(this.exp);
    return `${exp} ${this.operator}`;
  }
}

class IsNullCondition extends UnarySuffixOperatorCondition {
  constructor(exp: Expression) {
    super(exp, "IS NULL");
  }
}

class BinaryOperatorCondition extends Condition {
  constructor(
    private expA: Expression,
    private expB: Expression,
    private operator: string
  ) {
    super();
  }

  public toString(): string {
    const expA = getExpToString(this.expA);
    const expB = getExpToString(this.expB);
    return `${expA} ${this.operator} ${expB}`;
  }
}

class EqualityCondition extends BinaryOperatorCondition {
  constructor(expA: Expression, expB: Expression) {
    super(expA, expB, "=");
  }
}

class NonEqualityCondition extends BinaryOperatorCondition {
  constructor(expA: Expression, expB: Expression) {
    super(expA, expB, "!=");
  }
}

class GreaterThanCondition extends BinaryOperatorCondition {
  constructor(expA: Expression, expB: Expression) {
    super(expA, expB, ">");
  }
}

class LessThanCondition extends BinaryOperatorCondition {
  constructor(expA: Expression, expB: Expression) {
    super(expA, expB, "<");
  }
}

class LikeCondition extends BinaryOperatorCondition {
  constructor(expA: Expression, value: string) {
    super(expA, value, "LIKE");
  }
}

class MatchCondition extends BinaryOperatorCondition {
  constructor(expA: Expression, value: string, caseSensitive: boolean) {
    super(expA, value, caseSensitive ? "~" : "~*");
  }
}

class ChainedConjunctionCondition extends Condition {
  constructor(
    private subConditions: TableValues,
    private subConditionGenerator: (
      field: TableField,
      value: SqlValue
    ) => Condition,
    private conjunction: string
  ) {
    super();
  }

  public toString(): string {
    if (Object.keys(this.subConditions).length === 0) {
      return "";
    }
    return `(${_.toPairs(this.subConditions)
      .map(([field, value]) => this.subConditionGenerator(f(field), value))
      .join(` ${this.conjunction} `)})`;
  }
}

class AndEqualityCondition extends ChainedConjunctionCondition {
  constructor(equalities: TableValues) {
    super(equalities, eq, "AND");
  }
}

class OrEqualityCondition extends ChainedConjunctionCondition {
  constructor(equalities: TableValues) {
    super(equalities, eq, "OR");
  }
}

class AndLikeCondition extends ChainedConjunctionCondition {
  constructor(checks: TableValues) {
    super(checks, like, "AND");
  }
}

export const isNull = (exp: Expression): Condition => {
  return new IsNullCondition(exp);
};

export const lt = (expA: Expression, expB: Expression): Condition => {
  return new LessThanCondition(expA, expB);
};

export const gt = (expA: Expression, expB: Expression): Condition => {
  return new GreaterThanCondition(expA, expB);
};

export const neq = (expA: Expression, expB: Expression): Condition => {
  return new NonEqualityCondition(expA, expB);
};

export const eq = (expA: Expression, expB: Expression): Condition => {
  return new EqualityCondition(expA, expB);
};

export const like = (expA: Expression, value: string): Condition => {
  return new LikeCondition(expA, value);
};

export const match = (
  expA: Expression,
  value: string | RegExp,
  caseSensitive = true
): Condition => {
  if (value instanceof RegExp) {
    return new MatchCondition(expA, value.source, caseSensitive);
  }
  return new MatchCondition(expA, value, caseSensitive);
};

export const and = (...conditions: Condition[]) => {
  return new AndCondition(...conditions);
};

export const or = (...conditions: Condition[]) => {
  return new OrCondition(...conditions);
};

export const andEq = (equalities: TableValues): Condition => {
  return new AndEqualityCondition(equalities);
};

export const orEq = (equalities: TableValues): Condition => {
  return new OrEqualityCondition(equalities);
};

export const andLike = (checks: TableValues): Condition => {
  return new AndLikeCondition(checks);
};
