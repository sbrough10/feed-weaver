import { isString } from "lodash";

enum RequestMethod {
  Delete = "DELETE",
  Get = "GET",
  Post = "POST",
  Put = "PUT",
}

export interface RequestOptions {
  params?: Record<string, any>;
  body?: any;
}

const httpRequest = (
  path: string,
  method: RequestMethod,
  options: RequestOptions
) => {
  const { params, body } = options;
  const queryParams = new URLSearchParams();
  let resolvedPath = path;
  for (let param in params) {
    if (resolvedPath.indexOf(`:${param}`) !== -1) {
      resolvedPath = resolvedPath.replace(`:${param}`, `${params[param]}`);
    } else {
      queryParams.append(
        param,
        isString(params[param]) ? params[param] : JSON.stringify(params[param])
      );
    }
  }
  const url =
    resolvedPath + (queryParams.size > 0 ? `?${queryParams.toString()}` : "");
  return fetch(
    url,
    method === RequestMethod.Get
      ? undefined
      : {
          headers: {
            "Content-Type": "application/json",
          },
          method,
          body: JSON.stringify(body ?? {}),
        }
  ).then((res) => res.json());
};

class HttpRequest {
  constructor(
    private path: string,
    private method: RequestMethod,
    private options: RequestOptions = {}
  ) {}

  exec() {
    return httpRequest(this.path, this.method, this.options);
  }
}

export class GetRequest extends HttpRequest {
  constructor(path: string, options?: RequestOptions) {
    super(path, RequestMethod.Get, options);
  }
}

export class PostRequest extends HttpRequest {
  constructor(path: string, options?: RequestOptions) {
    super(path, RequestMethod.Post, options);
  }
}

export class PutRequest extends HttpRequest {
  constructor(path: string, options?: RequestOptions) {
    super(path, RequestMethod.Put, options);
  }
}

export class DeleteRequest extends HttpRequest {
  constructor(path: string, options?: RequestOptions) {
    super(path, RequestMethod.Delete, options);
  }
}
