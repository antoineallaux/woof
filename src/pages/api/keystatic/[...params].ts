// API Keystatic : auth GitHub + lecture/écriture du contenu
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import type { APIRoute } from 'astro';
import config from '../../../../keystatic.config';

export const prerender = false;

const handler = makeGenericAPIRouteHandler({
  config,
  clientId: import.meta.env.KEYSTATIC_GITHUB_CLIENT_ID,
  clientSecret: import.meta.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
  secret: import.meta.env.KEYSTATIC_SECRET,
});

export const ALL: APIRoute = async ({ request }) => {
  const keystatic = await handler({
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
    body: new Uint8Array(await request.arrayBuffer()),
  });

  return new Response(keystatic.body, {
    status: keystatic.status,
    headers: keystatic.headers as HeadersInit,
  });
};
