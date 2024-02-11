import { useEffect } from "react";
import { action, select, useDispatch, useSelector } from "..";
import { UserPostData } from "feed-weaver-shared";

export const useUserPostList = () => {
  const dispatch = useDispatch();

  const batch = useSelector(select.getUserPostBatch);

  useEffect(() => {
    if (batch && (batch.isLoading || batch.isValid)) {
      return;
    }
    dispatch(action.loadUserPostList());
  }, [batch]);

  return batch ? batch.list : [];
};

export const useUpdateUserPost = () => {
  const dispatch = useDispatch();

  return (postId: UserPostData["id"], data: Partial<UserPostData>) => {
    dispatch(action.updateUserPost(postId, data));
  };
};
