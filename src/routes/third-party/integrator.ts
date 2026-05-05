import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const integratorRouter = Router();

integratorRouter.post('/integrator', (req, res) => {
  res.json({
    result: {
      accepted: true,
      action: req.body?.action ?? 'mock-action',
      id: 'mock-integrator-result',
    },
  });
});

integratorRouter.post('/webhooks/integrator', (req, res) => {
  res.json({
    result: {
      accepted: true,
      action: req.body?.action ?? 'mock-action',
      id: 'mock-integrator-webhook-result',
    },
  });
});

registerRoute({
  method: 'POST',
  path: '/integrator',
  description: 'Returns a mock external integrator success response.',
});

registerRoute({
  method: 'POST',
  path: '/webhooks/integrator',
  description: 'Alias route for mock external integrator webhook success.',
});
