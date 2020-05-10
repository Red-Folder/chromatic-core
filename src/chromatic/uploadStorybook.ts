import setupDebug from 'debug';
import GraphQLClient from './io/GraphQLClient';
import { readdirSync, statSync, createReadStream } from 'fs';
import { join } from 'path';
import { URL } from 'url';
import slash from 'slash';
import retry from 'async-retry';
import fetch, { Headers } from 'node-fetch';

const CHROMATIC_RETRIES = 5;

const debug = setupDebug('chromatic-core:uploadStorybook');

const TesterGetUploadUrlsMutation = `
mutation TesterGetUploadUrlsMutation($paths: [String!]!) {
  getUploadUrls(paths: $paths) {
    domain
    urls {
      path
      url
      contentType
    }
  }
}
`;

export interface UploadInformationUrlInfo {
  path: string,
  url: string,
  contentType: string
}

export interface UploadInformation {
  domain: string,
  urls: UploadInformationUrlInfo[]
}

export interface GetUploadsUrls {
  getUploadUrls : UploadInformation
}


interface PathAndLength {
  pathname: string,
  contentLength: number,
  knownAs: string
}

// Get all paths in rootDir, starting at dirname.
// We don't want the paths to include rootDir -- so if rootDir = storybook-static,
// paths will be like iframe.html rather than storybook-static/iframe.html
function getPathsInDir(rootDir: string, dirname = '.'): Array<PathAndLength> {
  return readdirSync(join(rootDir, dirname))
    .map(p => join(dirname, p))
    .map(pathname => {
      const stats = statSync(join(rootDir, pathname));
      if (stats.isDirectory()) {
        return getPathsInDir(rootDir, pathname);
      }
      return [{ pathname, contentLength: stats.size }];
    })
    .reduce((a, b) => [...a, ...b], []) as Array<PathAndLength>; // flatten
}

export async function uploadStorybook(source: string, jwtToken: string) : Promise<string> {
  debug(`uploading '${source}' to s3`);
  
  const pathAndLengths = getPathsInDir(source).map(o => ({ ...o, knownAs: slash(o.pathname) }));

  const paths = pathAndLengths.map(({ knownAs }) => knownAs);
  
  const client = new GraphQLClient({
    retries: 3,
    jwtToken: jwtToken
  });

  const { getUploadUrls: { domain, urls } } = await client.runQuery<GetUploadsUrls>(TesterGetUploadUrlsMutation, { paths });

  const uploads = new Array<Promise<void>>();
  urls.forEach(({ path, url, contentType }) => {
    const pathWithDirname = join(source, path);
    debug(`uploading '${pathWithDirname}' to '${url}' with content type '${contentType}'`);

    const contentLength = pathAndLengths.find(({ knownAs }) => knownAs === path)?.contentLength;
    uploads.push(
      retry(
        async () => {
          const res = await fetch(url, {
            method: 'PUT',
            body: createReadStream(pathWithDirname),
            headers: {
              'content-type': contentType,
              'content-length': contentLength,
              'cache-control': 'max-age=31536000',
            } as any as Headers, 
          });

          if (!res.ok) {
            debug(`Uploading '${path}' failed: %O`, res);
            throw new Error(`Failed to upload ${path}`);
          }
          debug(`Uploaded '${path}'.`);
        },
        {
          retries: CHROMATIC_RETRIES,
          onRetry: err => {
            debug('Retrying upload %s, %O', url, err);
          }
        }
      )
    );
  });

  await Promise.all(uploads);

  // NOTE: Storybook-specific
  return new URL('/iframe.html', domain).toString();
}
