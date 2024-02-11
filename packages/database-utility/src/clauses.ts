import { Condition } from "./conditions";
import { Order } from "./order";

export class Limit {
  constructor(private amount: number) {}

  toString(): string {
    return ` LIMIT ${this.amount}`;
  }
}

export const limit = (amount: number) => {
  return new Limit(amount);
};

export class Offset {
  constructor(private amount: number) {}

  toString(): string {
    return ` OFFSET ${this.amount}`;
  }
}

export const offset = (amount: number) => {
  return new Offset(amount);
};

export enum JoinType {
  Full = "FULL",
  Left = "LEFT",
  Right = "RIGHT",
  Inner = "INNER",
}
export class Join {
  constructor(
    private type: JoinType,
    private tableName: string,
    private on: Condition
  ) {}

  toString(): string {
    return ` ${this.type} JOIN "${this.tableName}" ON ${this.on.toString()}`;
  }
}

export type Clause = Order | Condition | Limit | Offset | Join;

export const buildClauseString = (clauses: Clause[]): string => {
  const joins: string[] = [];
  let where = "";
  const orders: string[] = [];
  let endString = "";

  clauses.forEach((clause) => {
    if (clause instanceof Join) {
      joins.push(clause.toString());
    } else if (clause instanceof Condition) {
      const condition = clause.toString();
      if (condition.length > 0) {
        where = ` WHERE ${condition}`;
      }
    } else if (clause instanceof Order) {
      orders.push(clause.toString());
    } else {
      endString += clause.toString();
    }
  });

  if (orders.length > 0) {
    endString = ` ORDER BY ${orders.join(", ")}` + endString;
  }

  return joins.join(" ") + where + endString;
};
