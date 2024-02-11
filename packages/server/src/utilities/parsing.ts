import playwright from "playwright";
import {
  Platform,
  PostMedia,
  PostMediaType,
  UserPostData,
} from "feed-weaver-shared";
import { MD5 } from "./md5";
import { getDom } from "./common";
import { comparePosts } from "./ranking";

export type SourcePostsMap = { [source: string]: UserPostData[] };

type ParsedUserPostData = Omit<UserPostData, "id" | "isArchived" | "media">;
type PostFeedPageParser = (
  pageUrl: string,
  dom: Document,
  source: string
) => ParsedUserPostData[];

type PostMediaPageParser = (data: {
  pageUrl: string;
  dom: Document;
}) => PostMedia;

export const scrapeForum = async (
  browser: playwright.Browser,
  pageUrl: string,
  source: string,
  parsePage: PostFeedPageParser
): Promise<UserPostData[]> => {
  try {
    const page = await browser.newPage();

    await page.goto(pageUrl, {});

    const posts = parsePage(
      pageUrl,
      await getDom(page),
      source
    ).map<UserPostData>((parsedPost) => ({
      ...parsedPost,
      id: MD5(parsedPost.url),
      isArchived: false,
      media: { type: PostMediaType.None },
    }));

    console.log(`Processed ${posts.length} posts from ${source}`);

    return posts.sort(comparePosts);
  } catch (error) {
    console.error(`Error occurred during scrape of ${source}`);
    console.error(error);

    return [];
  }
};

export const getFullHyperlink = (
  path: string,
  hostname: string,
  replaceHostname?: boolean
) => {
  if (path.startsWith("https://")) {
    if (replaceHostname) {
      const url = new URL(path);
      return url
        .toString()
        .replace(url.hostname, hostname.split("//")?.[1] ?? url.hostname);
    }
    return path;
  }
  return new URL(path, hostname).toString();
};

const getElementHyperlink = (
  element: Element,
  selector: string,
  attribute: "href" | "src" | "data-href-url",
  hostname: string,
  replaceHostname?: boolean
): string => {
  const linkElement = element.querySelector(selector);
  if (!linkElement) {
    return "";
  }
  const href = linkElement.getAttribute(attribute);
  if (!href) {
    return "";
  }
  return getFullHyperlink(href, hostname, replaceHostname);
};

const getNumberFromText = (text: string | null | undefined) => {
  if (!text) {
    return 0;
  }
  const trimText = text.trim().toLowerCase();
  let numberFromText = parseFloat(trimText);
  if (isNaN(numberFromText)) {
    return 0;
  }
  if (trimText.endsWith("k")) {
    numberFromText = numberFromText * 1000;
  }
  return Math.floor(numberFromText);
};

const getCommentCount = (element: Element, selector: string): number => {
  const linkText = element.querySelector(selector)?.textContent;
  if (!linkText) {
    return 0;
  }
  return getNumberFromText(linkText.trimStart().split(" ")[0]);
};

export const parseRedditPosts: PostFeedPageParser = (pageUrl, dom, source) => {
  const posts: ParsedUserPostData[] = [];

  const postEls = dom.querySelectorAll(".thing:not(.stickied)");
  for (const postEl of postEls) {
    const voteDiff = getNumberFromText(
      postEl.querySelector(".score.unvoted")?.textContent
    );
    const title = postEl.querySelector("a.title")?.textContent ?? "";
    const fullPostUrl = getElementHyperlink(
      postEl,
      ".comments",
      "href",
      "https://reddit.com",
      true
    );
    const commentCount = getCommentCount(postEl, ".comments");
    const mediaUrl = getElementHyperlink(
      postEl,
      "a.title",
      "href",
      "https://reddit.com",
      true
    );

    const currentTimestamp = new Date().getTime();
    // Make the default timestamp a few days ago
    let timestamp = currentTimestamp - 1000 * 60 * 60 * 24 * 3;

    posts.push({
      voteDiff,
      title,
      author: "",
      url: fullPostUrl,
      commentCount,
      platform: Platform.Reddit,
      platformFeed: source,
      timestamp,
    });
  }

  return posts;
};

export const parseCommunitiesDotWinPosts: PostFeedPageParser = (
  pageUrl,
  dom,
  source
) => {
  const posts: ParsedUserPostData[] = [];

  const postEls = dom.querySelectorAll(".post");
  for (const postEl of postEls) {
    const title = postEl.querySelector("a.title")?.textContent ?? "";
    const voteDiff = getNumberFromText(
      postEl.querySelector(".vote .count")?.textContent
    );
    const fullPostUrl = getElementHyperlink(
      postEl,
      ".comments",
      "href",
      "https://patriots.win"
    );
    const commentCount = getCommentCount(postEl, ".comments");

    const currentTimestamp = new Date().getTime();
    // Make the default timestamp a few days ago
    let timestamp = currentTimestamp - 1000 * 60 * 60 * 24 * 3;

    posts.push({
      title,
      voteDiff,
      url: fullPostUrl,
      author: "",
      commentCount,
      platform: Platform.TheDonald,
      timestamp,
    });
  }

  return posts;
};

export const parseLemmyMlPosts: PostFeedPageParser = (pageUrl, dom, source) => {
  const posts: ParsedUserPostData[] = [];

  const postEls = dom.querySelectorAll(".post-listing");
  for (const postEl of postEls) {
    const title = postEl.querySelector(".post-title")?.textContent ?? "";
    const voteDiff = getNumberFromText(
      postEl.querySelector(".vote-bar .unselectable")?.textContent
    );
    const fullPostUrl = getElementHyperlink(
      postEl,
      ".post-title a",
      "href",
      pageUrl
    );
    const commentCount = getNumberFromText(
      postEl
        .querySelector("a[data-tippy-content*=Comment]")
        ?.textContent?.substring("message-square".length)
    );

    const currentTimestamp = new Date().getTime();
    // Make the default timestamp a few days ago
    let timestamp = currentTimestamp - 1000 * 60 * 60 * 24 * 3;
    let dateString = postEl.querySelector(".moment-time")?.textContent;

    // "edit" text sometimes included in date string
    const editSplit = dateString?.split("-");

    if (editSplit) {
      switch (editSplit.length) {
        case 1:
        case 2: {
          dateString = editSplit[editSplit.length - 1];
          const infoSplit = dateString?.split(" ");
          // We expect there to be three parts
          // 1. The number
          // 2. The time unit
          // 3. The word "ago"
          const timeAmount = parseInt(infoSplit[0]);
          const timeUnit = infoSplit[1];
          const timestampDiff =
            timeAmount *
            (() => {
              switch (timeUnit) {
                case "second":
                case "seconds":
                  return 1000;
                case "minute":
                case "minutes":
                  return 1000 * 60;
                case "hour":
                case "hours":
                  return 1000 * 60 * 60;
                case "day":
                case "days":
                  return 1000 * 60 * 60 * 24;
                case "week":
                case "weeks":
                  return 1000 * 60 * 60 * 24 * 7;
                case "month":
                case "months":
                  return 1000 * 60 * 60 * 24 * 30;
                case "year":
                case "years":
                  return 1000 * 60 * 60 * 24 * 365;
                default:
                  console.error(`Cant interpret this time unit: ${timeUnit}`);
                  return 0;
              }
            })();
          timestamp = currentTimestamp - timestampDiff;
          break;
        }
        default:
          console.error(`I don't know what to do with this: ${dateString}`);
      }
    } else {
      console.error(`There is no timestamp for "${title}", ${fullPostUrl}`);
    }

    if (editSplit)
      posts.push({
        title,
        voteDiff,
        author: "",
        url: fullPostUrl,
        commentCount,
        platform: Platform.Fediverse,
        platformFeed: source,
        timestamp,
      });
  }

  return posts;
};

export const parseWebDevPosts: PostFeedPageParser = (pageUrl, dom, source) => {
  const posts: ParsedUserPostData[] = [];

  const postEls = dom.querySelectorAll("article.card");
  for (const postEl of postEls) {
    const title = postEl.querySelector(".card__heading a")?.textContent ?? "";
    const fullPostUrl = getElementHyperlink(
      postEl,
      ".card__heading a",
      "href",
      "https://web.dev"
    );

    const currentTimestamp = new Date().getTime();
    // Make the default timestamp a few days ago
    let timestamp = currentTimestamp - 1000 * 60 * 60 * 24 * 3;

    posts.push({
      title,
      voteDiff: 1,
      url: fullPostUrl,
      author: "",
      commentCount: 1,
      platform: Platform.WebDev,
      timestamp,
    });
  }

  return posts;
};

export const parseRDramaPosts: PostFeedPageParser = (pageUrl, dom, source) => {
  const posts: ParsedUserPostData[] = [];

  const postEls = dom.querySelectorAll(".actual-post");
  for (const postEl of postEls) {
    const title = (
      postEl.querySelector(".post-title")?.textContent ?? ""
    ).trim();
    const fullPostUrl = getElementHyperlink(
      postEl,
      ".post-actions a.list-inline-item",
      "href",
      "https://rdrama.net"
    );
    const voteDiff = getNumberFromText(
      postEl.querySelector(".voting .score")?.textContent
    );

    const commentCount = getNumberFromText(
      postEl.querySelector(".post-actions a.list-inline-item")?.textContent
    );

    const currentTimestamp = new Date().getTime();
    // Make the default timestamp a few days ago
    let timestamp = currentTimestamp - 1000 * 60 * 60 * 24 * 3;

    posts.push({
      title,
      voteDiff,
      url: fullPostUrl,
      author: "",
      commentCount,
      platform: Platform.RDrama,
      timestamp,
    });
  }

  return posts;
};

export const parseSaiditPosts: PostFeedPageParser = (pageUrl, dom, source) => {
  const posts: ParsedUserPostData[] = [];

  const postEls = dom.querySelectorAll(".thing:not(.stickied)");
  for (const postEl of postEls) {
    const voteEl = postEl.querySelector(".unvoted");
    const voteDiff =
      getNumberFromText(
        voteEl?.querySelector(".arrow.up .score")?.textContent
      ) +
      getNumberFromText(
        voteEl?.querySelector(".arrow.down .score")?.textContent
      );
    const title = postEl.querySelector("a.title")?.textContent ?? "";
    const fullPostUrl = getElementHyperlink(
      postEl,
      ".comments",
      "href",
      "https://saidit.net"
    );
    const commentCount = getCommentCount(postEl, ".comments");

    const currentTimestamp = new Date().getTime();
    // Make the default timestamp a few days ago
    let timestamp = currentTimestamp - 1000 * 60 * 60 * 24 * 3;

    posts.push({
      voteDiff,
      title,
      url: fullPostUrl,
      author: "",
      commentCount,
      platform: Platform.Saidit,
      timestamp,
    });
  }

  return posts;
};

export const platformParserMap: Record<Platform, PostFeedPageParser> = {
  [Platform.Reddit]: parseRedditPosts,
  [Platform.Fediverse]: parseLemmyMlPosts,
  [Platform.TheDonald]: parseCommunitiesDotWinPosts,
  [Platform.WebDev]: parseWebDevPosts,
  [Platform.RDrama]: parseRDramaPosts,
  [Platform.Saidit]: parseSaiditPosts,
};

// export const parseRedditPostMedia: PostMediaPageParser = ({ pageUrl, dom }) => {
//   const postEl = dom.querySelector("shreddit-post");

//   if (!postEl) {
//     throw Error(`No post content container found for ${pageUrl}`);
//   }

//   const videoEl = postEl.querySelector("shreddit-player");

//   if (videoEl) {
//     const src = videoEl.getAttribute("src");
//     if (!src) {
//       throw Error(
//         `Video element does not have discernable "src" attribute on ${pageUrl}`
//       );
//     }
//     return {
//       type: PostMediaType.Video,
//       src,
//     };
//   }

//   const imageEl = postEl.querySelector('shreddit-aspect-ratio img');

//   if (imageEl) {
//     const src = imageEl.getAttribute("src");
//   if (!src) {
//     throw Error(
//       `Image element does not have discernable "src" attribute on ${pageUrl}`
//     );
//   }
//     return {
//       type: PostMediaType.Image,
//       src
//     }
//   }

//   const blurredContainer = postEl.querySelector("shreddit-blurred-container");

//   if (blurredContainer)
// };
