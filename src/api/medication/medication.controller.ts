import type { Request, RequestHandler, Response } from "express";
import { medicationService } from "@/api/medication/medication.service";
import { CreateMedication, UpdateMedication } from "./medication.dto";

class MedicationController {
  create: RequestHandler = async (req: Request, res: Response) => {
    const data = req.body as CreateMedication;
    const result = await medicationService.create(data);
    res.status(result.statusCode).json(result);
  };

  update: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateMedication;
    const result = await medicationService.update(id, data);
    res.status(result.statusCode).json(result);
  };

  metrics: RequestHandler = async (req: Request, res: Response) => {
    const { provider_id } = req.query;
    const result = await medicationService.getMetrics(
      provider_id as string | undefined
    );
    res.status(result.statusCode).json(result);
  };
}

export const medicationController = new MedicationController();
