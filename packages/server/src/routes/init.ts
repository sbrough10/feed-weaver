import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";

export const app = express();

app.use(cookieParser());

app.use("/", express.static("../client/build"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  let data = "";
  req.body = {};
  req.on("data", (chunk) => {
    data += chunk.toString("utf8");
  });
  req.on("end", () => {
    const contentType = req.get("Content-Type");
    if (contentType) {
      switch (contentType) {
        case "application/json":
          try {
            req.body = JSON.parse(data);
          } catch (err) {
            res
              .status(406)
              .send(
                `Content type is JSON but request body was not in JSON format: ${data}`
              );
            return;
          }
          break;
        case "application/x-www-form-urlencoded":
          const params = new URLSearchParams(data);
          params.forEach((value, key) => {
            req.body[key] = value;
          });
          break;
        default:
          res.status(415).send(`Unrecognized content type: ${contentType}`);
          return;
      }
    }
    next();
  });
});

export const hasParam =
  (param: string, getParams: (req: Request) => any) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!Object.prototype.hasOwnProperty.apply(getParams(req), [param])) {
      res.status(400).send(`Parameter was not supplied: ${param}`);
      return;
    }
    next();
  };

export const hasBodyParam = (param: string) =>
  hasParam(param, (req) => req.body);

export const hasCookieParam = (param: string) =>
  hasParam(param, (req) => req.cookies);

export const hasQueryParam = (param: string) =>
  hasParam(param, (req) => req.query);
