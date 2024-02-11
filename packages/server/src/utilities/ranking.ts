import { Platform, UserPostData, getSourceName } from "feed-weaver-shared";

export type SourceWeightMap = Record<string, number>;
export type SourceOccurrenceMap = Record<string, number>;

const upvoteWeight = 1;
const commentCountWeight = 3;
const recencyWeight = 0.75;
const varietyWeight = 5;

/**
 * Post rating ignoring the existing of other posts
 */
const getIndividualPostRating = (post: UserPostData) => {
  const currentTimestamp = new Date().getTime();
  return (
    (post.commentCount * commentCountWeight + post.voteDiff * upvoteWeight) /
    Math.pow(currentTimestamp - post.timestamp, recencyWeight)
  );
};

export const comparePosts = (a: UserPostData, b: UserPostData) => {
  return getIndividualPostRating(b) - getIndividualPostRating(a);
};

export const getPostRating = (
  post: UserPostData | undefined,
  sourceOccurrenceMap: SourceOccurrenceMap,
  sourceWeightMap: SourceWeightMap
) => {
  if (!post) {
    return -1;
  }
  const sourceOccurrence = sourceOccurrenceMap[getSourceName(post)] ?? 0;
  const rating =
    (getIndividualPostRating(post) * sourceWeightMap[getSourceName(post)]) /
    (sourceOccurrence + 1) ** varietyWeight;

  if (isNaN(rating)) {
    console.error(post);
    console.error(sourceWeightMap[getSourceName(post)]);
    console.error(sourceOccurrence);
    throw Error("Rating is not a number");
  }

  return rating;
};
