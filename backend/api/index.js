import handler, { app } from '../dist/serverless.js';

export default function(req, res) {
  return handler(req, res);
}

export { app, handler };
