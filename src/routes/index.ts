import express, { type Express } from "express";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";

const router = express.Router();


router.use("/users", userRouter);


export default  router;