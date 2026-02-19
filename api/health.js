export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      ok: true,
      vercel: !!process.env.VERCEL,
      hasJwt: !!process.env.JWT_SECRET,
      hasDb: !!(process.env.DB_HOST && process.env.DB_PASSWORD),
    })
  );
}
