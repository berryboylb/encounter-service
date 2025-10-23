import type { Request, RequestHandler, Response } from "express";
import type { UpdatePatient } from "@/api/patient/patient.dto";
import { patientService } from "@/api/patient/patient.service";
import { baseFilter } from "@/types/express.types";

class PatientController {
  // ✅ findProfile
  public findProfile: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await patientService.findProfile(req.account?.id!);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ updateProfile
  public updateProfile: RequestHandler = async (
    req: Request<{}, {}, UpdatePatient>,
    res: Response
  ) => {
    const serviceResponse = await patientService.updateProfile(
      req.account?.id!,
      req.body
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ get Patients
  public getPatients: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await patientService.findAll(
      _req.query as unknown as baseFilter
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ get Patient
  public getPatient: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await patientService.findOne(_req.params.id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ delete my profile
  public deleteMyPatientProfile: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await patientService.delete(_req.account?.id!);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ delete patient by id
  public deletePatient: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await patientService.delete(_req.params.id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const patientController = new PatientController();
