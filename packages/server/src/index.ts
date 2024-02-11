import { hasTaskRunInLastHour, runTask } from "./tasks";
import { app } from "./routes";
import { runCountryScrapeTask } from "./tasks/country-scrape";
import { ServerSideTaskType } from "feed-weaver-shared";

const PORT = process.env.PORT || 4000;

// runCountryScrapeTask();

(async () => {
  // TODO - Clear all running tasks

  if (!(await hasTaskRunInLastHour(ServerSideTaskType.ForumScrape))) {
    runTask(ServerSideTaskType.ForumScrape);
  }
})();

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
