import { getUseSelector, createStore, getUseDispatch } from "redux-util";
import { FullState } from "./dux/index.types";
import * as userPost from "./dux/user-post";

export const action = {
  ...userPost.action,
};

export const select = {
  ...userPost.select,
};

const reducer = {
  userPost: userPost.reducer,
};

export const store = createStore<FullState>(reducer);

export const useSelector = getUseSelector<FullState>();

export const useDispatch = getUseDispatch<FullState>();

export * from "./hooks";
