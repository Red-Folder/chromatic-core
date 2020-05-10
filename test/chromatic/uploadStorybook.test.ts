import { uploadStorybook } from '../../src/chromatic/uploadStorybook';

const token = 'VALID TOKEN';
const source = 'C:\\storybook-static';

jest.mock('../../src/chromatic/io/GraphQLClient', () => () => ({
    runQuery: (_query: string, _variables: any): Promise<any> => {
        return new Promise((resolve, _reject) => {
            return resolve({
                "getUploadUrls": {
                    "domain": "https://test-domain.chromatic.com/",
                    "urls": [
                        {
                            "path": "favicon.ico",
                            "url": "https://chromatic-builds.s3.amazonaws.com/test-domain/favicon.ico?AWSAccessKeyId=ACCESSKEY&Content-Type=image%2Fvnd.microsoft.icon&Expires=1589124799&Signature=SIGNATURE",
                            "contentType": "image/vnd.microsoft.icon"
                        }
                    ]
                }
            });
        });
    }
}));

jest.mock('fs');
import { readdirSync, statSync, createReadStream } from 'fs';
const mockedReaddirSync = (readdirSync as any) as jest.Mock;
mockedReaddirSync.mockReturnValue(['favicon.ico']);
const mockedStatSync = (statSync as any) as jest.Mock;
mockedStatSync.mockReturnValue({
    isDirectory: () => false,
    size: 100
});
const mockedCreateReadStream = (createReadStream as any) as jest.Mock;
mockedCreateReadStream.mockReturnValue(require('stream').Readable.from([
    'TEXT'
]));

jest.mock('node-fetch');
import fetch from 'node-fetch';
const {Response} = jest.requireActual('node-fetch');
const mockedFetch = ((fetch as any) as jest.Mock);
mockedFetch.mockReturnValue(Promise.resolve(new Response()));


describe('uploadStorybook', () => {
    it('to get details from GraphQL and upload to s3', async () => {
        const url = await uploadStorybook(source, token); 
        
        expect(url).toBe('https://test-domain.chromatic.com/iframe.html');
    });
});