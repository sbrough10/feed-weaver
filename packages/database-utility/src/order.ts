import _ from "lodash";
import { CaseStatement } from "./case";
import { TableField } from "./utils";

enum Direction {
  Asc = "ASC",
  Desc = "DESC",
}

export type SortExpression = CaseStatement | TableField;

export abstract class SortCalculation {
  abstract toString(): string;
}

// class SortIf extends SortCalculation {
//   constructor(private condition: Condition, private ifTrue: number, private ifFalse: number) {
//     super();
//   }

//   toString(): string {
//     return `IF(${this.condition.toString()}, ${this.ifTrue}, ${this.ifFalse})`;
//   }
// }

// export const sortIf = (condition: Condition, ifTrue: number, ifFalse: number) => {
//   return new SortIf(condition, ifTrue, ifFalse);
// };

export class Order {
  constructor(private sortExp: SortExpression, private direction: Direction) {}

  toString(): string {
    return `${this.sortExp.toString()} ${this.direction}`;
  }
}

export const asc = (sortExp: SortExpression): Order => {
  return new Order(sortExp, Direction.Asc);
};

export const desc = (sortExp: SortExpression): Order => {
  return new Order(sortExp, Direction.Desc);
};
