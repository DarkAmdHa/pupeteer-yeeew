import express from "express";
import dotenv from "dotenv";
import colors from "colors";

import { errorHandler } from "./middleware/errorMiddleware.js";

import generateDataRoutes from "./routes/generateDataRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/data", generateDataRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV === "development") {
  app.get("/", (req, res) => {
    res.json({
      message: "Success",
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `App Running on Port ${PORT} in ${process.env.NODE_ENV} mode`.cyan.underline
  );
});
