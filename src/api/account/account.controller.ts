import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { accountService } from "@/api/account/account.service";
import { baseFilter, RequestWithQuery } from "../../types/express.types";

class AccountController {
  public getAccounts: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await accountService.findAll(
      _req.query as unknown as baseFilter
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await accountService.findById(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getMe: RequestHandler = async (req: Request, res: Response) => {
    const { password, ...rest } = req.account!;
    res
      .status(StatusCodes.OK)
      .send({ message: "account fetched successfully", data: rest });
  };
}

export const accountController = new AccountController();
