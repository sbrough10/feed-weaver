import React, { useCallback, useState } from "react";
import { classes } from "./styles";
import { ReadPostToggle } from "../ReadPostToggle";
import { UserPostData, getSourceName } from "feed-weaver-shared";
import { useUpdateUserPost } from "app/state";

interface PostSummaryProps {
  data: UserPostData;
  isRead: boolean;
}

export const PostSummary: React.FC<PostSummaryProps> = (props) => {
  const { data: post } = props;

  const updatePost = useUpdateUserPost();

  const { id, isArchived } = post;

  const onReadToggle = useCallback(() => {
    updatePost(id, { isArchived: !isArchived });
  }, [isArchived, id, updatePost]);

  return (
    <div className={classes.post}>
      <div className={classes.actionColumn}>
        <ReadPostToggle onClick={onReadToggle} isRead={isArchived} />
      </div>
      <div className={classes.detailsColumn}>
        <div className={classes.postDetails}>
          <p className={classes.postTitle}>
            <a href={post.url}>{post.title}</a>
          </p>
          <p>{getSourceName(post)}</p>
          <p>
            {post.commentCount} comments, {post.voteDiff} upvotes
          </p>
        </div>
      </div>
    </div>
  );
};
