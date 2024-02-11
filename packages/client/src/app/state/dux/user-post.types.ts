import { PostFeed, UserPostData } from "feed-weaver-shared";
import { AsyncActionType } from "redux-util";
import { FullState } from "./index.types";
import { WithBatchMap } from "redux-util/lib/types";

export interface UserPostBatchQuery {
  feedId: PostFeed["id"];
}

export interface UserPostState
  extends WithBatchMap<UserPostData, UserPostBatchQuery> {}

export interface LoadUserPostListActionData {
  list: UserPostData[];
  query: UserPostBatchQuery;
}

export const types = {
  loadUserPostList: new AsyncActionType<
    FullState,
    UserPostBatchQuery,
    LoadUserPostListActionData,
    UserPostBatchQuery
  >("userPost.loadList"),
  updateUserPost: new AsyncActionType<FullState, null, UserPostData, void>(
    "userPost.update"
  ),
};
