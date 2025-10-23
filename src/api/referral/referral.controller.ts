import type { Request, RequestHandler, Response } from "express";
import { referralService } from "@/api/referral/referral.service";
import { CreateReferral, UpdateReferral } from "./referral.dto";

class ReferralController {
  create: RequestHandler = async (req: Request, res: Response) => {
    const data = req.body as CreateReferral;
    const result = await referralService.create(data);
    res.status(result.statusCode).json(result);
  };

  update: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateReferral;
    const result = await referralService.update(id, data);
    res.status(result.statusCode).json(result);
  };

  metrics: RequestHandler = async (req: Request, res: Response) => {
    const { provider_id } = req.query;
    const result = await referralService.getMetrics(
      provider_id as string | undefined
    );
    res.status(result.statusCode).json(result);
  };
}

export const referralController = new ReferralController();
