import playwright from "playwright";
import { JSDOM } from "jsdom";
import { UserPostData } from "feed-weaver-shared";

export const getDom = async (page: playwright.Page) => {
  // Parse the HTML from the webpage so that we can easily find tags and extract information
  const content = await page.content();
  return new JSDOM(content).window.document;
};
