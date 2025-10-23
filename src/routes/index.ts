import express, { type Express } from "express";
import { accountRouter } from "@/api/account/account.router";
import { authRouter } from "@/api/auth/auth.routes";
import { providerRouter } from "@/api/provider/provider.routes";
import { branchRouter } from "@/api/branch/branch.routes";
import { patientRouter } from "@/api/patient/patient.routes";
import { encounterRouter } from "@/api/encounter/encounter.routes";
import { testRouter } from "@/api/test/test.routes";
import { medicationRouter } from "@/api/medication/medication.routes";
import { referralRouter } from "@/api/referral/referral.routes";

const router = express.Router();

// ===============================
// Routes List Starts
// ===============================

router.use("/accounts", accountRouter);
router.use("/auth", authRouter);
router.use("/providers", providerRouter);
router.use("/branches", branchRouter);
router.use("/patients", patientRouter);
router.use("/encounters", encounterRouter);
router.use("/tests", testRouter);
router.use("/medications", medicationRouter);
router.use("/referrals", referralRouter);

// ===============================
// Routes List Ends
// ===============================

export default router;
