import { TableField } from "./utils";

export class AggregateFunction {
  constructor(private operator: string, private field: TableField) {}

  toString(): string {
    return `${this.operator}(${this.field.toString()})`;
  }
}
class MinAggregate extends AggregateFunction {
  constructor(field: TableField) {
    super("MIN", field);
  }
}

class MaxAggregate extends AggregateFunction {
  constructor(field: TableField) {
    super("MAX", field);
  }
}

export const min = (field: TableField): MinAggregate => {
  return new MinAggregate(field);
};

export const max = (field: TableField): MaxAggregate => {
  return new MaxAggregate(field);
};
