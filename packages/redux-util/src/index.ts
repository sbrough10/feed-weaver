import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import logger from "redux-logger";
import { produce } from "immer";
import { isEqual, set } from "lodash";
import {
  Action,
  Batch,
  BatchStatus,
  Dispatch,
  ItemTemplate,
  WithBatchMap,
} from "./types";

import _ from "lodash";

export * from "./http";
export * from "./react";

export const getBatchListByQuery = <Item extends ItemTemplate, Query>(
  state: WithBatchMap<Item, Query>,
  query: Query
) => {
  return Object.values(state.batchMap).filter((batch) => {
    for (const field in query) {
      if (!isEqual(batch.query[field], query[field])) {
        return false;
      }
    }
    return true;
  });
};

export const getBatchListByIdList = <Item extends ItemTemplate, Query>(
  state: WithBatchMap<Item, Query>,
  idList: Item["id"][]
) => {
  return Object.values(state.batchMap).filter((batch) => {
    return idList.some((id) => batch.idList.indexOf(id) !== -1);
  });
};

export interface BatchWithItemList<Item> extends BatchStatus {
  list: Item[];
}

export const getItemsWithBatch = <Item extends ItemTemplate, Query>(
  state: WithBatchMap<Item, Query>,
  batch: Batch<Item, Query>
): BatchWithItemList<Item> => {
  return {
    list: batch.idList.map((id) => state.byId[id]),
    lastFetched: batch.lastFetched,
    isDeleting: batch.isDeleting,
    isLoading: batch.isLoading,
    isUpdating: batch.isUpdating,
    isValid: batch.isValid,
  };
};

export const setItemBatchStatus = <Item extends ItemTemplate, Query>(
  state: WithBatchMap<Item, Query>,
  query: Query,
  status: Partial<BatchStatus>
) => {
  const batchList = getBatchListByQuery(state, query);

  if (batchList.length > 0) {
    batchList.forEach((batch) => {
      for (const key in status) {
        batch[key] = status[key];
      }
    });
  } else {
    state.batchMap[JSON.stringify(query)] = {
      isLoading: status.isLoading ?? false,
      isValid: status.isValid ?? false,
      isDeleting: status.isDeleting ?? false,
      isUpdating: status.isUpdating ?? false,
      lastFetched: status.lastFetched ?? new Date().getTime(),
      query,
      idList: [],
    };
  }
};

export const addItemBatch = <Item extends ItemTemplate, Query>(
  state: WithBatchMap<Item, Query>,
  query: Query,
  itemList: Item[],
  addToById: boolean = true
) => {
  const batchList = getBatchListByQuery(state, query);

  if (batchList.length > 0) {
    batchList.forEach((batch) => {
      batch.isLoading = false;
      batch.isValid = true;
      batch.lastFetched = new Date().getTime();
      batch.idList = itemList.map((item) => item.id);
    });
  } else {
    // TODO - Create actual hash for batch key
    state.batchMap[JSON.stringify(query)] = {
      isLoading: false,
      isDeleting: false,
      isUpdating: false,
      isValid: true,
      lastFetched: new Date().getTime(),
      query,
      idList: itemList.map((item) => item.id),
    };
  }

  if (addToById) {
    itemList.forEach((item) => {
      state.byId[item.id] = item;
    });
  }
};

type Reducer<StateSlice, Data> = (
  state: StateSlice,
  actionData: Data
) => StateSlice;

type ActionHandlerMap<StateSlice> = {
  [actionType: string]: Reducer<StateSlice, any>;
};

export class AsyncActionType<FullState, PendingData, SuccessData, FailureData> {
  constructor(public type: string) {}

  createAction(
    pendingData: PendingData,
    attempt: (
      dispatch: Dispatch<FullState>,
      getState: () => FullState
    ) => Promise<SuccessData>,
    fallback?: (
      error: any,
      dispatch: Dispatch<FullState>,
      getState: () => FullState
    ) => FailureData
  ) {
    return (dispatch: Dispatch<FullState>, getState: () => FullState) => {
      dispatch({ type: `${this.type}.pending`, data: pendingData });
      return attempt(dispatch, getState)
        .then((result) =>
          dispatch({ type: `${this.type}.success`, data: result })
        )
        .catch((error) => {
          console.error(`Error in redux action: ${this.type}`);
          console.error(error);
          dispatch({
            type: `${this.type}.failure`,
            data: fallback?.(error, dispatch, getState),
          });
        });
    };
  }

  createReducer<StateSlice>(handler: {
    pending?: Reducer<StateSlice, PendingData>;
    success?: Reducer<StateSlice, SuccessData>;
    failure?: Reducer<StateSlice, FailureData>;
  }): ActionHandlerMap<StateSlice> {
    return {
      [`${this.type}.pending`]: handler.pending,
      [`${this.type}.success`]: handler.success,
      [`${this.type}.failure`]: handler.failure,
    };
  }
}

export class ActionType<FullState, Data> {
  constructor(public type: string) {}

  createAction(
    action: (dispatch: Dispatch<FullState>, getState: () => FullState) => Data
  ) {
    return (dispatch: Dispatch<FullState>, getState: () => FullState) => {
      return dispatch({ type: this.type, data: action(dispatch, getState) });
    };
  }

  createReducer<StateSlice>(
    handler: (state: StateSlice, data: Data) => StateSlice
  ): ActionHandlerMap<StateSlice> {
    return {
      [this.type]: handler,
    };
  }
}

export const createSliceReducer = <StateSlice>(
  initialState: StateSlice,
  actionHandlerMapList: ActionHandlerMap<StateSlice>[]
) => {
  let sliceReducerMap: ActionHandlerMap<StateSlice> = {};
  actionHandlerMapList.forEach((actionHandlerMap) => {
    sliceReducerMap = { ...sliceReducerMap, ...actionHandlerMap };
  });

  return (state = initialState, action: Action<any>) => {
    return sliceReducerMap[action.type]?.(state, action.data) ?? state;
  };
};

export const createStore = <
  FullState extends { [sliceKey: string]: any }
>(reducerMap: {
  [reducerKey: string]: (state: any, action: Action<any>) => any;
}) => {
  const rootReducer = (state: FullState, action: Action<any>) => {
    return produce(state ?? {}, (draft) => {
      for (const sliceReducerKey in reducerMap) {
        set(
          draft,
          sliceReducerKey,
          reducerMap[sliceReducerKey](draft[sliceReducerKey], action)
        );
      }
    });
  };

  const store = configureStore({
    reducer: rootReducer,
    middleware: [thunk, logger],
  });

  // This initiates all the slices for the state
  store.dispatch({ type: "init", data: undefined });

  return store;
};
