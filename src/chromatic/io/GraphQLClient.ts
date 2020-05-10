import HTTPClient from './HTTPClient';
import { Headers } from 'node-fetch';

const CHROMATIC_GRAPHQL_URL = 'https://index.chromaticqa.com/graphql';

interface GraphQLClientOptions {
  headers: Headers;
  retries: number;
}

export default class GraphQLClient {
  headers: Headers;
  retries: number;
  client: HTTPClient;

  constructor({ headers, retries }: GraphQLClientOptions) {
    this.headers = headers;
    this.retries = retries;
    this.client = new HTTPClient();
  }

  async runQuery<T>(query: string, variables: any): Promise<T> {
    const response = await this.client.fetch(
      CHROMATIC_GRAPHQL_URL,
      {
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        method: 'post',
        body: JSON.stringify({ query, variables }),
      },
      { retries: this.retries }
    );

    const { data, errors } = await response.json();

    if (errors) throw errors;

    return data as T;
  }

  // Convenience static method.
  //static async runQuery(options: GraphQLClientOptions, query: string, variables: any) {
  //  return new GraphQLClient(options).runQuery(query, variables);
  //}
}
