import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();

app.use(cors());

app.use(express.json());

// Mount campaigns router at /campaigns
import campaignsRouter from "@/routers";
app.use("/campaigns", campaignsRouter);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
