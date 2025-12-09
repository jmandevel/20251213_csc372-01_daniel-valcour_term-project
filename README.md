# Glyphs Online

Glyphs Online is an interactive website for working with unicode characters.

Live Site: https://glyphs-online-server.onrender.com/

## Setup Instructions

1. Configure all enviornment variables by adding .env files and updating control panels in Google Authenticator, Neon, and Render. See [.env.example](./.env.example).
2. Seed the database with Unicode data by running `npm run seed`.
3. Deploy the site to a server and run the following bash commands:

```bash
npm install # install all packages
npm run build # build the react front end
npm run start # start the webserver
```

*Note:* The webserver delivers the front-end when visited by users. All REST API routes are located in the `/api/` subdomain.