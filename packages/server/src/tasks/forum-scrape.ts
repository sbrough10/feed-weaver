import playwright from "playwright";
import { Platform, UserPostData, getSourceName } from "feed-weaver-shared";
import { ServerSideTaskRoutine } from ".";
import {
  SourcePostsMap,
  parseCommunitiesDotWinPosts,
  parseLemmyMlPosts,
  parseRDramaPosts,
  parseRedditPosts,
  parseSaiditPosts,
  parseWebDevPosts,
  scrapeForum,
} from "../utilities/parsing";
import { lemmyCommunities, sourceWeightMap, subreddits } from "../feed-config";
import { SourceOccurrenceMap, getPostRating } from "../utilities/ranking";
import { Database } from "../database";

export const runForumScrapeTask: ServerSideTaskRoutine = async () => {
  console.log("Starting new scrape of forum pages");

  const browser = await playwright.chromium.launch();
  const forumScrapeList: Promise<UserPostData[]>[] = [];

  // SCRAPE THE DONALD
  forumScrapeList.push(
    scrapeForum(
      browser,
      "https://patriots.win",
      Platform.TheDonald,
      parseCommunitiesDotWinPosts
    )
  );

  // SCRAPE SELECTED LEMMY COMMUNINITIES

  for (const community of lemmyCommunities) {
    forumScrapeList.push(
      scrapeForum(
        browser,
        `https://lemmy.ml/c/${community}`,
        community,
        parseLemmyMlPosts
      )
    );
  }

  // SCRAPE WEB.DEV

  forumScrapeList.push(
    scrapeForum(
      browser,
      "https://web.dev/blog",
      Platform.WebDev,
      parseWebDevPosts
    )
  );

  // SCRAPE RDRAMA

  forumScrapeList.push(
    scrapeForum(
      browser,
      "https://rdrama.net",
      Platform.RDrama,
      parseRDramaPosts
    )
  );

  // SCRAPE SAIDIT

  forumScrapeList.push(
    scrapeForum(
      browser,
      "https://saidit.net",
      Platform.Saidit,
      parseSaiditPosts
    )
  );

  // SCRAPE SELECTED SUBREDDITS

  for (const subreddit of subreddits) {
    forumScrapeList.push(
      Promise.resolve(
        await scrapeForum(
          browser,
          `https://old.reddit.com/r/${subreddit}`,
          `r/${subreddit}`,
          parseRedditPosts
        )
      )
    );
  }

  // SORT POSTS BY PRIORITY

  const sourcePostListMap: SourcePostsMap = {};
  const sourceOccurrenceMap: SourceOccurrenceMap = {};
  let sourceCount = 0;

  const perSourcePostList = await Promise.all(forumScrapeList);

  for (const postList of perSourcePostList) {
    const source = getSourceName(postList[0]);
    if (source) {
      sourcePostListMap[source] = postList;
    }

    sourceCount++;
  }

  const postList: UserPostData[] = [];
  const postMap: Map<string, UserPostData> = new Map();

  // Do this until we run out of posts or until the feed is 400 posts long
  while (
    postList.length < 400 &&
    Object.values(sourcePostListMap).some((posts) => posts.length > 0)
  ) {
    // Create source & top-post-rating objects from each source's list of posts
    const topPostEntries: [string, number][] = Object.entries(
      sourcePostListMap
    ).map(([source, posts]) => [
      source,
      getPostRating(posts[0], sourceOccurrenceMap, sourceWeightMap),
    ]);

    // Identify the source with the heighest post rating
    let topEntry: [string, number] = topPostEntries[0];

    for (let s = 1; s < topPostEntries.length; s++) {
      if (topEntry[1] < topPostEntries[s][1]) {
        topEntry = topPostEntries[s];
      }
    }

    // Extract the source name from the source & top-post-rating object
    const source = topEntry[0];

    // Remove the post from the source's list of posts
    const post = sourcePostListMap[source].shift();

    // If there is no post, something went wrong
    if (!post) {
      console.error(`Source: ${source}`);
      console.error(sourcePostListMap);
      throw `Post ranking error occurred for source "${source}". See logs for details.`;
    }

    // If the post is marked as "Read" then we don't add it to the post feed
    if (!(await Database.isUserPostArchived(post.id))) {
      postList.push(post);
      postMap.set(post.id, post);
      sourceOccurrenceMap[source] = (sourceOccurrenceMap[source] ?? 0) + 1;
    }
  }

  const info = `${postList.length} posts from ${sourceCount} sources sorted`;

  console.log(info);
  console.log(`Scrape completed ${new Date().toLocaleString("en")}`);
  await browser.close();

  // Remove all the unread posts to make room for the new ones
  await Database.deleteUnarchivedUserPostList();
  // Add the new post list to the database
  await Database.createUserPostList(postList);

  return info;
};
