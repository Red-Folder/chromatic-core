import HTTPClient from './HTTPClient';
import { Headers } from 'node-fetch';

const CHROMATIC_GRAPHQL_URL = 'https://index.chromaticqa.com/graphql';

interface GraphQLClientOptions {
  retries: number;
  jwtToken?: string;
}

export default class GraphQLClient {
  retries: number;
  client: HTTPClient;

  constructor({ retries, jwtToken }: GraphQLClientOptions) {
    this.retries = retries;

    let headers = { 'Content-Type': 'application/json' } as any as Headers;
    if (jwtToken) {
      headers = { 
        ...headers,
        Authorization: `Bearer ${jwtToken}` 
      } as any as Headers;
    }

    this.client = new HTTPClient({headers : headers});
  }

  async runQuery<T>(query: string, variables: any): Promise<T> {
    const response = await this.client.fetch(
      CHROMATIC_GRAPHQL_URL,
      {
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
