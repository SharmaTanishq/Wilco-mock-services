import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { commerceRouter } from './routes/commerce';
import { avalaraRouter } from './routes/third-party/avalara';
import { authorizeNetRouter } from './routes/third-party/authorize-net';
import { integratorRouter } from './routes/third-party/integrator';
import { kountOAuthRouter, kountRouter } from './routes/third-party/kount';
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
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
    });
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/__mock/routes', (_req, res) => {
    res.json({ routes: getRegisteredRoutes() });
  });

  app.get('/ups', (_req, res) => {
    res.json({
      provider: 'ups',
      status: 'ok',
      message: 'Use /ups/* UPS mock routes.',
    });
  });
  app.get('/kount', (_req, res) => {
    res.json({
      provider: 'kount',
      status: 'ok',
      message: 'Use /kount/* Kount mock routes.',
    });
  });
  app.get('/kount-oauth', (_req, res) => {
    res.json({
      provider: 'kount-oauth',
      status: 'ok',
      message: 'OmniAPI KOUNT_ISSUER base — POST /v1/token only.',
    });
  });
  app.get('/avalara', (_req, res) => {
    res.json({
      provider: 'avalara',
      status: 'ok',
      message: 'Use /avalara/* Avatax mock routes.',
    });
  });
  app.get('/authnet', (_req, res) => {
    res.json({
      provider: 'authnet',
      status: 'ok',
      message: 'Use /authnet/* Authorize.Net mock routes.',
    });
  });

  app.use('/commerce', commerceRouter);
  /** Path-prefixed mounts for env bases like `.../ups`, `.../kount`, `.../avalara`, `.../authnet`. */
  app.use('/ups', upsRouter);
  app.use('/kount', kountRouter);
  app.use('/kount-oauth', kountOAuthRouter);
  app.use('/avalara', avalaraRouter);
  app.use('/authnet', authorizeNetRouter);
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
