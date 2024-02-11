import {
  Platform,
  PostFeed,
  Subscription,
  getSourceName,
} from "feed-weaver-shared";
import { SourceWeightMap } from "./utilities/ranking";

const subredditsNeedingMedia = ["fixedbytheduet", "awwww", "ich_iel"];

export const subreddits = [
  "2ALiberals",
  "ActualPublicFreakouts",
  "amiwrong",
  "AmITheAsshole",
  "Anarcho_Capitalism",
  "anime_titties",
  "AITAH",
  "AskALawyer",
  "BestofRedditorUpdates",
  "BroadRipple",
  "Canada_sub",
  "CanadianConservative",
  "CCW",
  "Centrist",
  "Conservatives",
  "Conspiracy",
  "conspiracy_commons",
  "Dachschaden",
  "FullNEWS",
  "GamingCirclejerk",
  "geopolitics",
  "Indiana",
  "Indianapolis",
  "inthenews",
  "Kentucky",
  "law",
  "legal",
  "LegalAdvice",
  "LegalAdviceUK",
  "Libertarian",
  "Louisville",
  "MensRights",
  "neutralnews",
  "NeutralPolitics",
  "NoLockedThreads",
  "PublicFreakout",
  "sanepolitics",
  "ShitLiberalsSay",
  "stupidpol",
  "SubredditDrama",
  "todayilearned",
  "TrueAnon",
  "TrueOffMyChest",
  "UnresolvedMysteries",
  "WorldNews",
  "youshouldknow",
];

export const lemmyCommunities = [
  "Dach@feddit.de",
  "Deutschland@feddit.de",
  "de_EDV@feddit.de",
  "Europe@feddit.de",
  "GenZedong@lemmygrad.ml",
  "LateStageCapitalism@lemmygrad.ml",
  "News@beehaw.org",
  "Politics@beehaw.org",
  "Politics@lemmy.world",
  "News@kbin.social",
  "Reddit@lemmy.world",
  "Tech@kbin.social",
  "Technology@beehaw.org",
  "Technology@lemmy.ml",
  "Technology@lemmy.world",
  "ThePoliceProblem@lemmy.world",
  "UKPolitics@lemm.ee",
  "Ukraine_War_News@lemmygrad.ml",
  "USA@lemmy.ml",
  "World@lemmy.world",
  "WorldNews@lemmy.ml",
];

// export const theDonaldSource = "patriots.win";
// export const webDevSource = "web.dev";
// export const rDramaSoucre = "rDrama";
// export const saiditSource = "Saidit";

// export const sourceWeightMap: SourceWeightMap = {
//   [theDonaldSource]: 5,
//   [webDevSource]: 200,
//   [rDramaSoucre]: 10,
//   [saiditSource]: 10,
// };
// lemmyCommunities.forEach((community) => {
//   sourceWeightMap[community] = 40;
// });
// subreddits.forEach((subreddit) => {
//   sourceWeightMap[`r/${subreddit}`] = 1;
// });

export const mainFeed: PostFeed = { id: 0, name: "Main" };

export const postFeedMap: Record<PostFeed["id"], PostFeed> = {
  [mainFeed.id]: mainFeed,
};

export const subscriptionList: Subscription[] = [
  ...subreddits.map<Subscription>((subreddit) => ({
    feedId: mainFeed.id,
    platform: Platform.Reddit,
    platformFeed: `r/${subreddit}`,
    rankingWeight: 1,
  })),
  ...lemmyCommunities.map<Subscription>((community) => ({
    feedId: mainFeed.id,
    platform: Platform.Fediverse,
    platformFeed: community,
    rankingWeight: 40,
  })),
  { feedId: mainFeed.id, platform: Platform.RDrama, rankingWeight: 10 },
  { feedId: mainFeed.id, platform: Platform.Saidit, rankingWeight: 10 },
  { feedId: mainFeed.id, platform: Platform.TheDonald, rankingWeight: 5 },
  { feedId: mainFeed.id, platform: Platform.WebDev, rankingWeight: 200 },
];

export const sourceWeightMap: SourceWeightMap =
  subscriptionList.reduce<SourceWeightMap>((map, subscription) => {
    return {
      ...map,
      [getSourceName(subscription)]: subscription.rankingWeight,
    };
  }, {});
