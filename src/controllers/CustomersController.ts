import { prisma } from "../PrismaClient";
import { Request, Response } from "express";
import { Customer, Status } from "@prisma/client";

type UserWhoWantsToBeCustomer = {
  full_name: string
  email: string
  phone: string
  cpf_number: string
  address: string
  city: string
  state: string
  zipcode: string
  current_balance: number
  average_salary: number
  status: Status
}

export default class CustomersController {
  public async validateUserToBecomeCustomer(request: Request, response: Response) {
    const user: UserWhoWantsToBeCustomer = request.body
    
    user.average_salary >= 500 ?
    [user.status, user.current_balance] = [Status.Accepted, 200] :
    [user.status, user.current_balance] = [Status.Rejected, 0]

    try {
      await prisma.customer.create({
        data: {
          cpf: user.cpf_number,
          status: user.status,
          balance: user.current_balance,
        }
      }) 
    } catch (error) {
      return response.status(400).send({ message: 'Error in storing customer.', error: error })
    }

    let customerFound
    try {
      customerFound = await prisma.customer.findUnique({where: {cpf: user.cpf_number}})
    } catch (error) {
      return response.status(404).send({ message: 'Error in finding this customer created.', error: error })
    }

    return response.status(200).send({ customerFound })

    // Use kafka producer function to send user info (email) and status in a message
  }
}
