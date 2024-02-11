import {
  GetRequest,
  PostRequest,
  PutRequest,
  addItemBatch,
  createSliceReducer,
  getBatchListByQuery,
  getItemsWithBatch,
  setItemBatchStatus,
} from "redux-util";
import { FullState } from "./index.types";
import { UserPostState, types } from "./user-post.types";
import { ApiPath, UserPostData } from "feed-weaver-shared";

const InitialState: UserPostState = {
  batchMap: {},
  byId: {},
};

export const action = {
  loadUserPostList: () =>
    types.loadUserPostList.createAction(
      { feedId: 0 },
      async () => {
        const req = new GetRequest(ApiPath.Post);
        return { query: { feedId: 0 }, list: await req.exec() };
      },
      () => ({ feedId: 0 })
    ),
  updateUserPost: (postId: UserPostData["id"], data: Partial<UserPostData>) =>
    types.updateUserPost.createAction(null, async (dispatch, getState) => {
      const req = new PutRequest(ApiPath.PostById, {
        params: { postId },
        body: data,
      });
      await req.exec();
      return { ...select.getUserPostById(getState(), postId), ...data };
    }),
};

export const reducer = createSliceReducer(InitialState, [
  types.loadUserPostList.createReducer({
    pending: (state, query) => {
      setItemBatchStatus(state, query, { isLoading: true });
      return state;
    },
    success: (state, data) => {
      addItemBatch(state, data.query, data.list);
      return state;
    },
    failure: (state, query) => {
      setItemBatchStatus(state, query, { isLoading: false });
      return state;
    },
  }),
  types.updateUserPost.createReducer({
    success: (state, post) => {
      state.byId[post.id] = post;
      return state;
    },
  }),
]);

export const select = {
  getUserPostBatch: (state: FullState) => {
    const batchList = getBatchListByQuery(state.userPost, { feedId: 0 });

    if (batchList[0]) {
      return getItemsWithBatch(state.userPost, batchList[0]);
    }

    return undefined;
  },
  getUserPostById: (state: FullState, id: UserPostData["id"]) => {
    return state.userPost.byId[id];
  },
};
