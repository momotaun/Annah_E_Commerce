import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { AllExceptionsFilter } from './all-exceptions.filter';

jest.mock('@sentry/node', () => ({ captureException: jest.fn() }));

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new AllExceptionsFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ method: 'GET', url: '/api/test' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('does not report a routine 4xx HttpException to Sentry', () => {
    filter.catch(new BadRequestException('bad input'), host);

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
  });

  it('reports an unexpected non-HttpException error to Sentry as a 500', () => {
    const error = new Error('database exploded');

    filter.catch(error, host);

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, path: '/api/test' }),
    );
  });
});
