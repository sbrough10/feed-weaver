import { ApiPath, ServerSideTaskType, UserPostData } from "feed-weaver-shared";
import { app } from "./init";
import { Database } from "../database";
import { hasTaskRunInLastHour, runTask } from "../tasks";

let preventSimulReq = false;

app.get(ApiPath.Post, async (req, res) => {
  if (!preventSimulReq) {
    preventSimulReq = true;
    if (!(await hasTaskRunInLastHour(ServerSideTaskType.ForumScrape))) {
      runTask(ServerSideTaskType.ForumScrape);
    }
    preventSimulReq = false;
  }

  const postList = await Database.getUserPostList();

  res.send(postList);
});

app.put(ApiPath.PostById, async (req, res) => {
  const { postId } = req.params;
  const isArchived: boolean = req.body.isArchived;

  if (isArchived) {
    await Database.archivePost(postId);
  } else {
    await Database.unarchivePost(postId);
  }

  res.send({});
});
