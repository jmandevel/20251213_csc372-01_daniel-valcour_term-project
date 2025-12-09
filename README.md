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

## Reflection

I choose to make my frontend using React because I find it to be extremely simple to use. I appreciate how easy it is to encapsulate different components of a website using React components. I also like how the state variables work like event listeners. I am familiar with using event listeners from my time working with Java. 

I choose node.js for the server backend because it is efficient and it allowed me to develop the backend in the same language I developed the frontend. I used express to make it easier to set up routes. I used postgress SQL because it is very simple to setup and get working using neon.com. I found the postgress trigram search indexing package to be very helpful for implementing a search feature in my site. I used render for deployment because the free tier provides exactly what I needed, and I was able to set up my server with minimal effort. The same goes for Google Authenticator, which made it very easy to add user authentication to my site after I figured out how to utilize it correctly.

One of the largest challanges I had to overcome while developing my site was to implement logging in and out using a Google account. It initially did not work, and I had a difficult time troubleshooting what the issue was. I added debug log functions all over the place, and did some reasearch into what might have been causing the problem. After investigating multiple dead-ends, I eventually realized that the issue was due to cross-site security, and I could remove the need for this by simply deploying my frontend directly from my backend. I did this by unifying both projects, and suddenly everything was working.

Overall, I am very proud of what I accomplished with this project. I learned a lot about web development from this project. At the start of this semester, I had never worked with websites besides a few times I messed around with HTML and CSS. I had no experience with JavaScript, but I was surprised how easy it was to use. For a long time, I have looked down upon JavaScript as a messy language with hard to diagnose bugs. After using it, I still feel this way, because many of the features such as the `===` operator seem unecessarily confusing to me. However, I feel I at least understand JavaScript enough that I could use it again for other projects. I am also glad that I have learned more about how web technologies work. I now have a decent understaning of topics like REST, SQL, and deployment that I am sure will be helpful to know in the future.

If I kept working on this project in the future, I would add a tool for downloading unicode character data with filters applied in a csv file. I would find this very helpful for some of my own personal projects working with roguelike game frameworks. I would also probably add conversion tools between unicode and other text encodings. I would probably set this up by seeding the database with data gained from working with iconv, a command line tool for working with text encodings. In the future, I am interested in reimplementing this project as a standalone desktop application released under an free open source license. Maybe I could get an app like this working with something like Electron, which can be used to run websites like a desktop application. If I do this, I would probably switch the database to use SqlLite, because this does not require hosting a database system. This is something I am adding to my backlog of future project ideas that I will get to once I have enough time.