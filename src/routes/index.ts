import express, { type Express } from "express";
import { accountRouter } from "@/api/account/account.router";
import { authRouter } from "@/api/auth/auth.routes";
import { providerRouter } from "@/api/provider/provider.routes";
import { branchRouter } from "@/api/branch/branch.routes";
import { patientRouter } from "@/api/patient/patient.routes";

const router = express.Router();

router.use("/accounts", accountRouter);
router.use("/auth", authRouter);
router.use("/providers", providerRouter);
router.use("/branches", branchRouter);
router.use("./patients", patientRouter);

export default router;
