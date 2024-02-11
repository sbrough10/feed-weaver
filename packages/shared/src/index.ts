const API_PATH_PREFIX = "/api/v1";

export const ApiPath = {
  Post: API_PATH_PREFIX + "/post",
  PostById: API_PATH_PREFIX + "/post/:postId",
};

export enum Platform {
  Reddit = "Reddit",
  Fediverse = "The Fediverse",
  TheDonald = "TheDonald",
  WebDev = "web.dev",
  RDrama = "rDrama",
  Saidit = "Saidit",
}

export interface PostFeed {
  id: number;
  name: string;
}

export interface Source {
  /**
   * The platform from which this post was scraped
   */
  platform: Platform;
  /**
   * The feed on the platform from which this post was scraped.
   *
   * Some platforms may only have one feed, in which case this field is irrelevant.
   */
  platformFeed?: string;
}

export const getSourceName = (params: Source | undefined) => {
  if (!params) {
    return "";
  }
  const { platform, platformFeed } = params;
  return platform + (platformFeed ? ` - ${platformFeed}` : "");
};

export interface Subscription extends Source {
  feedId: PostFeed["id"];
  rankingWeight: number;
}

export enum PostMediaType {
  Video = "video",
  Image = "image",
  None = "none",
}

export interface NoPostMedia {
  type: PostMediaType.None;
}
export interface VideoPostMedia {
  type: PostMediaType.Video;
  src: string;
}

export interface ImagePostMedia {
  type: PostMediaType.Image;
  src: string;
}

export type PostMedia = NoPostMedia | VideoPostMedia | ImagePostMedia;

export interface UserPostData extends Source {
  /**
   * A unique ID by which to differentiate between posts
   */
  id: string;
  /**
   * The title summarizing the post as displayed on the feed page
   */
  title: string;
  /**
   * The URL to the page of the full post content and comments section
   */
  url: string;
  /**
   * The time when the post was created
   */
  timestamp: number;
  /**
   * The creator of the post
   */
  author: string;
  /**
   * The difference between upvotes and downvotes.
   *
   * Often, this number is fabricated to affect the ranking algorithm for posts
   */
  voteDiff: number;
  /**
   * The number of comments under the post
   */
  commentCount: number;
  /**
   * Media object describing the content of the post.
   *
   * This is mainly used for the summary of the content to be displayed on the feed page.
   */
  media: PostMedia;
  isArchived: boolean;
}

export enum ServerSideTaskType {
  ForumScrape = "forumScrape",
}

export enum ServerSideTaskRunStatus {
  Complete = 0,
  Running = 1,
  Canceled = 2,
  NoData = 3,
}

export interface ServerSideTaskRunData {
  type: ServerSideTaskType;
  startTime: number;
  endTime: number;
  status: ServerSideTaskRunStatus;
  info: string;
}
