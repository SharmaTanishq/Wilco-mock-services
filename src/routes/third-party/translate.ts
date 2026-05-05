import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const translateRouter = Router();

function translate(reqBody: unknown) {
  const body = reqBody as { q?: string | string[]; target?: string };
  const values = Array.isArray(body.q) ? body.q : [body.q ?? ''];

  return {
    data: {
      translations: values.map((value) => ({
        translatedText: `[mock:${body.target ?? 'en'}] ${value}`,
        detectedSourceLanguage: 'en',
      })),
    },
  };
}

translateRouter.post('/language/translate/v2', (req, res) => {
  res.json(translate(req.body));
});

translateRouter.post('/translate/v2', (req, res) => {
  res.json(translate(req.body));
});

registerRoute({
  method: 'POST',
  path: '/language/translate/v2',
  description: 'Returns mock Google Translate REST translations.',
});

registerRoute({
  method: 'POST',
  path: '/translate/v2',
  description: 'Alias for mock Google Translate REST translations.',
});
