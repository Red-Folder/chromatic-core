import pino, { SerializedError } from 'pino';
import { Response } from 'node-fetch';

const responseSerializer = (response: Response): any => {
  const _raw = (response as any)['_raw'];

  return {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    url: response.url,
    ...(_raw && { _raw: _raw.toString() }),
  };
}

// We *don't* want to log the envPairs key -- this is added by node and includes
// all of our environment variables! See https://github.com/chromaui/chromatic/issues/1993
// Note it is added to both err.envPairs *and* err.options.envPairs :facepalm:
function stripEnvPairs(err: SerializedError) {
  //const { envPairs, options: { envPairs: x, ...options } = {}, ...sanitizedErr } = err as any;
  //return { sanitizedErr, ...(err.options && { options }) };

  // TODO - need to do the above logic
  return err;
}

const errSerializer = (err: any): any => {
  const serializedErr = pino.stdSerializers.err(err);

  return {
    ...stripEnvPairs(serializedErr),
    // Serialize the response part of err with the response serializer
    ...(err.response && { response: responseSerializer(err.response) }),
  };
};

const serializers = {
  ...pino.stdSerializers,
  err: errSerializer,
};

export { serializers as default };
