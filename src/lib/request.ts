import middy, { Middy, MiddlewareObject } from 'middy';
import { HttpEventRequest } from 'advanext-models/lambda';
import { waitForSecrets, errorInterceptor } from 'toolbox/middlewares';

import secrets from '../secrets';

export const instrumentLambdaHandler = (
  func: (event: unknown, context: unknown) => Promise<unknown>
): Middy<unknown, unknown> => {
  const defaultMiddleware = [
    waitForSecrets(secrets),
    errorInterceptor(),
  ];

  return defaultMiddleware.reduce(
    (tmp, middleware) => tmp.use(middleware as MiddlewareObject<HttpEventRequest, unknown>),
    middy(func),
  );
};
