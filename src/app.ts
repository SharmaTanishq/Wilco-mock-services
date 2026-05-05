import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { commerceRouter } from './routes/commerce';
import { integratorRouter } from './routes/third-party/integrator';
import { kountRouter } from './routes/third-party/kount';
import { translateRouter } from './routes/third-party/translate';
import { unbxdRouter } from './routes/third-party/unbxd';
import { upsRouter } from './routes/third-party/ups';
import { googleAddressValidationRouter } from './routes/third-party/google-address-validation';
import { getRegisteredRoutes } from './mock-registry';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/__mock/routes', (_req, res) => {
    res.json({ routes: getRegisteredRoutes() });
  });

  app.use('/commerce', commerceRouter);
  app.use(upsRouter);
  app.use(googleAddressValidationRouter);
  app.use(translateRouter);
  app.use(kountRouter);
  app.use(unbxdRouter);
  app.use(integratorRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: 'mock_route_not_found',
      message: 'No mock response is registered for this path.',
    });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : 'Unexpected mock error';
    res.status(500).json({ error: 'mock_error', message });
  };

  app.use(errorHandler);

  return app;
}
