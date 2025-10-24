import type { Request, RequestHandler, Response } from "express";
import { medicationService } from "@/api/medication/medication.service";
import {
  CreateMedication,
  UpdateMedication,
  MedicationMetrics,
} from "./medication.dto";
import { baseFilter } from "@/types/express.types";

class MedicationController {
  create: RequestHandler = async (
    req: Request<{}, {}, CreateMedication>,
    res: Response
  ) => {
    const result = await medicationService.create(req.body);
    res.status(result.statusCode).json(result);
  };

  update: RequestHandler = async (
    req: Request<{ id?: string }, {}, UpdateMedication>,
    res: Response
  ) => {
    const result = await medicationService.update(
      req.params.id!,
      req.body,
      req.account!
    );
    res.status(result.statusCode).json(result);
  };

  metrics: RequestHandler = async (req: Request, res: Response) => {
    const result = await medicationService.getMetrics(
      req.query as unknown as MedicationMetrics
    );
    res.status(result.statusCode).json(result);
  };
  // ✅ Get all medications
  public getMedications: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await medicationService.findAll(
      req.query as unknown as baseFilter
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Get single encounter
  public getMedication: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await medicationService.findOne(req.params.id!);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Delete encounter
  public delete: RequestHandler = async (
    req: Request<{ id?: string }>,
    res: Response
  ) => {
    const serviceResponse = await medicationService.delete(
      req.params.id!,
      req.account?.role!,
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const medicationController = new MedicationController();
