import { RequestInfo, RequestInit, Response } from 'node-fetch';
import GraphQLClient from '../../../src/chromatic/io/GraphQLClient';
import { HTTPClientError } from '../../../src/chromatic/io/HTTPClient';
import { CreateAppTokenData } from '../../../src/chromatic/getToken';

const validResponse = new Response(JSON.stringify({
    "data": {
        "createAppToken": "VALID TOKEN"
    }
}));

const invalidResponse = new Response(JSON.stringify({
    "errors": [
        {
            "message": "No app with code 'INVALID CODE' found",
            "locations": [
                {
                    "line": 2,
                    "column": 3
                }
            ],
            "path": [
                "createAppToken"
            ],
            "extensions": {
                "code": "INTERNAL_SERVER_ERROR",
                "exception": {
                    "stacktrace": [
                        "Error: No app with code 'INVALID CODE' found",
                        "    at resolve (/app/services/index/dist/api/app/mutations/createAppToken.js:26:21)",
                        "    at runMicrotasks (<anonymous>)",
                        "    at processTicksAndRejections (internal/process/task_queues.js:97:5)"
                    ]
                }
            }
        }
    ],
    "data": null
}));

jest.mock('../../../src/chromatic/io/HTTPClient', () => () => ({
    fetch : (_url: RequestInfo, options: RequestInit, _overrides: any): Promise<any> =>{
        return new Promise((resolve, _reject) => {
            var body = JSON.parse(options['body'] as string);

            if (body.variables.key == 'VALID') {
                return resolve(validResponse);
            }

            throw new HTTPClientError(invalidResponse);
        }); 
    }
}));

describe('GraphQLClient', () => {
    const client = new GraphQLClient({ retries: 1 });

    it('with a valid request will return a Response', async () => {
        const response = await client.runQuery<CreateAppTokenData>('query', { key: 'VALID' })
        expect(response.createAppToken).toBe("VALID TOKEN");
    });

    it('with an invalid request will return an Error', async () => {
        const promise = client.runQuery('query', { key: 'INVALID' })
        await expect(promise).rejects.toThrowError();
    });
});