import _ from "lodash";
import { Expression, getExpToString } from "./oprations";

export const sanitize = (value: string) => {
  return value.replace(/'/g, "''").replace(/\\/g, "\\\\");
};

export interface SqlDataType {
  toString: () => string;
}

export interface TableFields {
  [field: string]: SqlDataType;
}

export class SequenceConfig {
  public startWith?: number;
  public incrementBy?: number;
  constructor(args: { startWith?: number; incrementBy?: number }) {
    this.startWith = args.startWith;
    this.incrementBy = args.incrementBy;
  }
}

export class CalculatedConfig {
  constructor(public expression: Expression) {}

  toString(): string {
    return `${getExpToString(this.expression)}`;
  }
}

export const sequenceConfigToString = ({
  startWith,
  incrementBy,
}: SequenceConfig) => {
  return [
    ...(startWith !== undefined
      ? [`MINVALUE ${startWith} START WITH ${startWith}`]
      : []),
    ...(incrementBy !== undefined ? [`INCREMENT BY ${incrementBy}`] : []),
  ].join(" ");
};

export interface GeneratedTableFields {
  [fields: string]: {
    type: SqlDataType;
    config?: SequenceConfig | CalculatedConfig;
  };
}

export type TableValues<F = { [field: string]: null }> = {
  [fieldName in keyof F]: SqlValue;
};

export type SqlValue = TableField | string | number | boolean | null;

export const handleSqlValue = (value: SqlValue) => {
  if (value instanceof TableField) return value.toString();
  return _.isString(value) ? `'${sanitize(value)}'` : value;
};

export class TableField {
  constructor(private name: string, private tableName?: string) {}

  toString(): string {
    return `${this.tableName ? `"${this.tableName}".` : ""}"${this.name}"`;
  }
}

export const f = (name: string | TemplateStringsArray) => {
  return new TableField(_.isString(name) ? name : name.raw[0]);
};
