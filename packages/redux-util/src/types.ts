import { ThunkDispatch } from "redux-thunk";

export interface Action<Data> {
  type: string;
  data: Data;
}

export type ItemTemplate = { id: string | number };

export interface BatchStatus {
  lastFetched: number;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isValid: boolean;
}

export interface Batch<Item extends ItemTemplate, Query> extends BatchStatus {
  idList: Item["id"][];
  query: Query;
}

type Serializable =
  | string
  | number
  | boolean
  | Serializable[]
  | { [key: string | number]: Serializable };

type QueryTemplate = { [field: string]: Serializable };

export interface WithBatchMap<Item extends ItemTemplate, Query> {
  byId: { [id: string | number]: Item };
  batchMap: { [batchHash: string]: Batch<Item, Query> };
}

export type Dispatch<State> = ThunkDispatch<State, undefined, Action<any>>;
