Philly AR Tours static release

Upload either:
- the contents of web-dist/
- or this zip file if your host accepts zipped static site uploads

Primary domain:
- https://philly-tours.com

Current live API / web companion origin:
- https://api.philly-tours.com

Current production posture:
- cinematic mobile-first web shell
- Google and Apple sign-in
- backend-issued session auth
- Cloudflare protection on the browser experience

Important:
- do not place real server secrets inside release artifacts
- server-only local secrets should live in `server.local.env` or server-owned runtime env files, not in public web bundles
