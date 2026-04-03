// Shirley, Xinyi, Jiayu, Marina
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import conf from "./conf/conf.js";
import Routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(bodyParser.json());

const normalize = (u) => (typeof u === "string" ? u.replace(/\/$/, "") : null);

const allowedOrigins = [
  process.env.WEBSITE_HOSTNAME && `https://${process.env.WEBSITE_HOSTNAME}`, // Azure injects this
  "http://localhost:5173",
  conf.CORS_ORIGIN1,
  conf.CORS_ORIGIN2,
  conf.CORS_ORIGIN3,
]
  .map(normalize)
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); 
      const clean = normalize(origin);
      if (allowedOrigins.includes(clean)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api", Routes); 

app.post("/testing", (req, res) => {
  console.log("Testing");
  res.send("Hello testing completed");
});

app.get("/", (req, res) => {
  res.send("Welcome to the Express Server!");
});

// Global error handler
app.use(errorHandler);

export default app;