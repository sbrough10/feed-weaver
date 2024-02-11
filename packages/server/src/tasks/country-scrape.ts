import { getDom } from "../utilities/common";
import { ServerSideTaskRoutine } from ".";
import playwright from "playwright";

export const runCountryScrapeTask: ServerSideTaskRoutine = async () => {
  const browser = await playwright.chromium.launch({ headless: false });

  const page = await browser.newPage();

  await page.goto(
    "https://www.britannica.com/topic/list-of-countries-1993160",
    {}
  );

  const dom = await getDom(page);

  const countryPageLinkElList = dom.querySelectorAll(
    "ul.topic-list a.md-crosslink"
  );

  // countryPageLinkElList.forEach(async (countryPageLinkEl) => {
  //   const countryPageUrl = countryPageLinkEl.getAttribute("href");

  //   if (!countryPageUrl) {
  //     return;
  //   }

  //   await page.goto(countryPageUrl, {});

  //   const dom = getDom(page);

  //   ("js-fact mb-10 line-clamp clamp-3");
  // });

  const countryCount = countryPageLinkElList.length;

  console.log(`Scraped ${countryCount} countries`);

  await browser.close();

  return `Scraped ${countryCount} countries`;
};
