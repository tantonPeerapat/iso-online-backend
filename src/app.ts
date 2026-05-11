import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";
import departmentRouter from "./routes/department.routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/departments", departmentRouter);

app.get("/", (_req, res) => {
  res.send("API is running 🚀");
});

export default app;
