import type { Request, RequestHandler, Response } from "express";
import { referralService } from "@/api/referral/referral.service";
import type {
  CreateReferral,
  UpdateReferral,
  ReferralMetrics,
} from "./referral.dto";
import type { baseFilter } from "@/types/express.types";

class ReferralController {
  // ✅ Create referral
  create: RequestHandler = async (
    req: Request<{}, {}, CreateReferral>,
    res: Response
  ) => {
    const result = await referralService.create(req.body);
    res.status(result.statusCode).json(result);
  };

  // ✅ Update referral
  update: RequestHandler = async (
    req: Request<{ id?: string }, {}, UpdateReferral>,
    res: Response
  ) => {
    const result = await referralService.update(
      req.params.id!,
      req.body,
      req.account!
    );
    res.status(result.statusCode).json(result);
  };

  // ✅ Get referral metrics
  metrics: RequestHandler = async (req: Request, res: Response) => {
    const result = await referralService.getMetrics(
      req.query as unknown as ReferralMetrics
    );
    res.status(result.statusCode).json(result);
  };

  // ✅ Get all referrals
  getReferrals: RequestHandler = async (req: Request, res: Response) => {
    const result = await referralService.findAll(
      req.query as unknown as baseFilter
    );
    res.status(result.statusCode).json(result);
  };

  // ✅ Get single referral
  getReferral: RequestHandler = async (req: Request, res: Response) => {
    const result = await referralService.findOne(req.params.id!);
    res.status(result.statusCode).json(result);
  };

  // ✅ Approve referral
  approve: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await referralService.approve(id);
    res.status(result.statusCode).json(result);
  };

  // ✅ Reject referral
  reject: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await referralService.reject(id);
    res.status(result.statusCode).json(result);
  };

  // ✅ Mark referral as ongoing
  markOngoing: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await referralService.markOngoing(id);
    res.status(result.statusCode).json(result);
  };

  // ✅ Mark referral as completed
  complete: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await referralService.complete(id);
    res.status(result.statusCode).json(result);
  };

  // ✅ Delete referral
  delete: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, id: account_id } = req.account!;
    const result = await referralService.delete(id, role, account_id);
    res.status(result.statusCode).json(result);
  };
}

export const referralController = new ReferralController();
