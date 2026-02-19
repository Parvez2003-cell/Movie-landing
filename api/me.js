import { getUserFromRequest } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const user = getUserFromRequest(req);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  if (!user) {
    res.end(JSON.stringify({ loggedIn: false }));
    return;
  }
  res.end(JSON.stringify({ loggedIn: true, userId: user.userId, name: user.name }));
}

