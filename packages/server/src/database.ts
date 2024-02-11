import {
  PostgressDatabase,
  QueryResult,
  SqlBigInt,
  SqlBoolean,
  SqlInt,
  SqlSmallInt,
  Varchar,
  and,
  andEq,
  asc,
  desc,
  eq,
  f,
  limit,
} from "database-utility";
import {
  ServerSideTaskRunData,
  ServerSideTaskRunStatus,
  ServerSideTaskType,
  UserPostData,
} from "feed-weaver-shared";
import { mainFeed } from "./feed-config";

const pgDb = new PostgressDatabase(
  process.env.DATABASE_URL ||
    `postgres://postgres:postgres@localhost:5432/feedweaver`
);

// const postFeedTable = pgDb.createTable(
//   "PostFeed",
//   {
//     name: new Varchar(32),
//     isDefault: SqlBoolean,
//   },
//   {
//     generatedFields: {
//       id: { type: SqlSmallInt },
//     },
//   }
// );

// const subscriptionTable = pgDb.createTable("Subscription", {
//   feedId: SqlSmallInt,
//   platform: new Varchar(32),
//   platformFeed: new Varchar(96),
// });

const feedPlacementTable = pgDb.createTable("FeedPlacement", {
  feedId: SqlSmallInt,
  postId: new Varchar(32),
  placement: SqlSmallInt,
});

const userPostTable = pgDb.createTable("UserPost", {
  id: new Varchar(32),
  title: new Varchar(1024),
  url: new Varchar(2048),
  timestamp: SqlBigInt,
  author: new Varchar(64),
  voteDiff: SqlInt,
  commentCount: SqlInt,
  media: new Varchar(4096),
  platform: new Varchar(32),
  platformFeed: new Varchar(96),
  isArchived: SqlBoolean,
});

const serverSideTaskRunTable = pgDb.createTable("ServerSideTaskRun", {
  type: new Varchar(32),
  startTime: SqlBigInt,
  endTime: SqlBigInt,
  status: SqlSmallInt,
  info: new Varchar(256),
});

pgDb.init();

type DbUserPostData = UserPostData & {
  /**
   * BigInts are treated as strings when fetched from the database
   */
  timestamp: string;
  media: string;
};
const convertUserPostFromDb = (dbData: DbUserPostData): UserPostData => ({
  ...dbData,
  timestamp: parseInt(dbData.timestamp),
  // media: JSON.parse(dbData.media),
});

export const Database = {
  async getLastServerSideTask(
    type: ServerSideTaskType
  ): Promise<ServerSideTaskRunData> {
    const result = (await serverSideTaskRunTable.selectAll(
      eq(f`type`, type),
      desc(f`startTime`),
      limit(1)
    )) as QueryResult<ServerSideTaskRunData>;
    if (result.rowCount > 0) {
      const data = result.rows[0];
      return {
        type,
        // Big ints are returned as strings
        startTime: parseInt(data.startTime as string),
        endTime: parseInt(data.endTime as string),
        status: data.status as ServerSideTaskRunStatus,
        info: data.status as string,
      };
    }
    return {
      type,
      startTime: 0,
      endTime: 0,
      status: ServerSideTaskRunStatus.NoData,
      info: "",
    };
  },

  async startServerSideTask(type: ServerSideTaskType) {
    const startTime = new Date().getTime();
    await serverSideTaskRunTable.insert([
      {
        type,
        startTime,
        endTime: startTime,
        status: ServerSideTaskRunStatus.Running,
        info: "",
      },
    ]);
    return startTime;
  },

  async completeServerSideTask(
    type: ServerSideTaskType,
    startTime: number,
    info: string
  ) {
    const endTime = new Date().getTime();
    const where = andEq({ type, startTime });
    await serverSideTaskRunTable.update(
      { endTime, status: ServerSideTaskRunStatus.Complete, info },
      where
    );
    return endTime;
  },

  async cancelServerSideTask(
    type: ServerSideTaskType,
    startTime: number,
    info: string
  ) {
    const endTime = new Date().getTime();
    const where = andEq({ type, startTime });
    await serverSideTaskRunTable.update(
      { endTime, status: ServerSideTaskRunStatus.Canceled, info },
      where
    );
    return endTime;
  },

  async isUserPostArchived(postId: UserPostData["id"]): Promise<boolean> {
    const result = await userPostTable.select(
      ["isArchived"],
      eq(f`id`, postId)
    );

    return (
      (result.rowCount > 0 &&
        (result.rows[0]?.isArchived as boolean | undefined)) ??
      false
    );
  },

  async deleteUnarchivedUserPostList() {
    await userPostTable.delete(eq(f`isArchived`, false));
    await feedPlacementTable.delete();
  },

  async createUserPostList(postList: UserPostData[]) {
    await userPostTable.insert(
      postList.map((post) => ({
        ...post,
        platformFeed: post.platformFeed ?? "",
        media: JSON.stringify({}),
      }))
    );

    await feedPlacementTable.insert(
      postList.map((post, index) => ({
        feedId: mainFeed.id,
        postId: post.id,
        placement: index,
      }))
    );
  },

  async getUserPostList(): Promise<UserPostData[]> {
    const result = await userPostTable.select(
      [
        "id",
        "title",
        "url",
        "timestamp",
        "author",
        "voteDiff",
        "commentCount",
        "platform",
        "platformFeed",
        "isArchived",
      ],
      feedPlacementTable.innerJoin(
        eq(feedPlacementTable.f`postId`, userPostTable.f`id`)
      ),
      eq(userPostTable.f`isArchived`, false),
      asc(feedPlacementTable.f`placement`)
    );
    const dbPostList: DbUserPostData[] =
      result.rows as unknown as DbUserPostData[];

    return dbPostList.map(convertUserPostFromDb);
  },

  async archivePost(postId: UserPostData["id"]) {
    await userPostTable.update({ isArchived: true }, eq(f`id`, postId));
  },

  async unarchivePost(postId: UserPostData["id"]) {
    await userPostTable.update({ isArchived: false }, eq(f`id`, postId));
  },
};
