import {
  ServerSideTaskRunData,
  ServerSideTaskRunStatus,
  ServerSideTaskType,
} from "feed-weaver-shared";
import _ from "lodash";
import { Database } from "../database";
import { runForumScrapeTask } from "./forum-scrape";

export type ServerSideTaskRoutine = (params?: any) => Promise<string>;

const taskCallback: Record<ServerSideTaskType, ServerSideTaskRoutine> = {
  [ServerSideTaskType.ForumScrape]: runForumScrapeTask,
};

export async function runTask(type: ServerSideTaskType, body?: any) {
  const startTime = await Database.startServerSideTask(type);

  const callback = taskCallback[type];

  callback(body)
    .then((info) => {
      Database.completeServerSideTask(type, startTime, info);
    })
    .catch((error) => {
      const info = (() => {
        if (error instanceof Error) {
          return error.message;
        } else if (_.isString(error)) {
          return error;
        }
        return `Unexpected error type in catch for failed task: ${typeof error}`;
      })();
      Database.cancelServerSideTask(type, startTime, info);
    });

  return startTime;
}

const MILLISECONDS_IN_AN_HOUR = 1000 * 60 * 60;

export async function hasTaskRunInLastHour(type: ServerSideTaskType) {
  const lastTask = await Database.getLastServerSideTask(type);
  if (lastTask.status !== ServerSideTaskRunStatus.NoData) {
    const unixTimestamp = new Date().getTime();
    if (lastTask.startTime + MILLISECONDS_IN_AN_HOUR > unixTimestamp) {
      return true;
    }
  }
  return false;
}
