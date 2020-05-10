/* eslint-disable max-classes-per-file */
import fetch, { Response, RequestInfo, RequestInit } from 'node-fetch';
import pino from 'pino';
import retry from 'async-retry';
import serializers from './serializers';

export class HTTPClientError extends Error {
  response: Response;
  constructor(fetchResponse: Response, message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HTTPClientError);
    }

    this.response = fetchResponse;
    this.message =
      message ||
      `HTTPClient Failed to fetch ${fetchResponse.url}, got ${fetchResponse.status}/${fetchResponse.statusText}`;
  }
}

interface HTTPClientOptions {
  log?: pino.Logger,
  retries?: any,
  headers?: any
}

// A basic wrapper class for fetch with the ability to retry fetches
export default class HTTPClient {
  log: pino.Logger;
  retries: number;
  headers: any;

  constructor(options: HTTPClientOptions = {}) {
    const { log = pino({ name: 'HTTPClient', serializers }), retries = 0, headers = {} } = options;
    this.log = log;
    this.retries = retries;
    this.headers = headers;
  }

  async fetch(url: RequestInfo, options: RequestInit = {}, { retries = 0, noLogErrorBody = false } = {}) {
    return retry(
      async () => {
        const res = await fetch(url, {
          ...options,
          headers: {
            ...this.headers,
            ...options.headers,
          },
        });

        if (!res.ok) {
          const error = new HTTPClientError(res);
          // You can only call text() or json() once, so if we are going to handle it outside of here..
          if (!noLogErrorBody) {
            const body = await res.text();
            this.log.warn({ body }, error.message);
          }

          throw error;
        }

        return res;
      },
      {
        // The user can override retries and set it to 0
        retries: typeof retries !== 'undefined' ? retries : this.retries,
        onRetry: err => {
          this.log.warn({ url, err }, 'Retrying fetch');
        },
      }
    );
  }

  //async fetchBuffer(url: RequestInfo, options?: RequestInit) {
  //  const res = await this.fetch(url, options);
  //  return res.buffer();
  //}

  // Convenience static methods
  //static async fetch(url: RequestInfo, fetchOptions: RequestInit = {}, clientOptions: HTTPClientOptions = {}) {
  //  return new HTTPClient(clientOptions).fetch(url, fetchOptions);
  //}

  //static async fetchBuffer(url: RequestInfo, fetchOptions: RequestInit = {}, clientOptions: HTTPClientOptions = {}) {
  //  return new HTTPClient(clientOptions).fetchBuffer(url, fetchOptions);
  //}
}
