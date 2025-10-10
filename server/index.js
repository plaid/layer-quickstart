// import dotenv and express
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";

// Load environment variables
dotenv.config();

const PORT = process.env.APP_PORT || 3001;

const required = ["PLAID_CLIENT_ID", "PLAID_SECRET", "LAYER_TEMPLATE_ID"];
const missing = required.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(
    `\n❌ Missing required environment variables: ${missing.join(", ")}`
  );
  console.error(
    "Please copy .env.template to .env and fill it in with the required values.\nSee README.md for more details."
  );
  process.exit(1);
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const routes = ["tokens"];

await Promise.all(
  routes.map(async (route) => {
    const routeModule = await import(`./routes/${route}.js`);
    app.use(`/server/${route}`, routeModule.default);
  })
);

/**
 * Add in some basic error handling so our server doesn't crash if we run into
 * an error.
 */
const errorHandler = function (err, req, res, next) {
  console.error(`Your error:`);
  if (err.response?.data != null) {
    res.status(500).send(err.response.data);
    console.error(err.response.data);
  } else {
    res.status(500).send({
      error_code: "OTHER_ERROR",
      error_message: "I got some other message on the server.",
    });
    console.error(JSON.stringify(err, null, 2));
  }
};
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
