import { prisma } from "../PrismaClient";
import { Request, Response } from "express";
import { Customer, Status } from "@prisma/client";

//to do: create validators

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

    let customerFound: Customer
    try {
      customerFound = await prisma.customer.findUniqueOrThrow({where: {cpf: user.cpf_number}})
    } catch (error) {
      return response.status(404).send({ message: 'Error in finding this customer created.', error: error })
    }

    return response.status(201).send({ customerFound })

    // Use kafka producer function to send user info (email) and status in a message
    // Use axios here to send lubycash-adonis back the info if user has become a customer because their role may have to change
  }

  public async listAllCustomers(request: Request, response: Response) {
    const { status, from, to } = request.body

    let customers: Customer[]
    if (status && !from && !to) {
      try {
        customers = await prisma.customer.findMany({where: {
          status: status
        }})
        return response.status(200).send({ customers })
      } catch (error) {
        return response.status(400).send({ message: 'Error in listing all customers.', error: error })
      }  
    }
    if (!status && from && to) {
      try {
        customers = await prisma.customer.findMany({where: {
          createdAt: {gte: new Date(from), lte: new Date(to)}, 
          }
        })
        return response.status(200).send({ customers })
      } catch (error) {
        return response.status(400).send({ message: 'Error in listing all customers.', error: error })  
      }
    }

    try {
      customers = await prisma.customer.findMany()
      return response.status(200).send({ customers })
    } catch (error) {
      return response.status(400).send({ message: 'Error in listing all customers.', error: error })
    }
  }

  public async getCustomersBankStatement(request: Request, response: Response){
    const { from, to } = request.body
    const customerCPF  = request.params.cpf
    
    try {
      await prisma.customer.findUniqueOrThrow({ where: { cpf: customerCPF }})
    } catch (error) {
      return response.status(404).send({ message: 'User not found.', error: error })
    }

    if (from && to) {
      try {
        const transfers = await prisma.transfer.findMany({where: { AND: {
          receiver: { is: { cpf: customerCPF }},
          sender: { is: { cpf: customerCPF }}, 
          createdAt: { gte: new Date(from), lte: new Date(to)}
        }}})
        return response.status(200).send({ transfers })
      } catch (error) {
        return response.status(400).send({ message: 'Error in retrieving transfers from this customer.', error: error })
      }
    }

    try {
      const transfers = await prisma.transfer.findMany({ where: {
        AND: {
          receiver: { is: { cpf: customerCPF }},
          sender: { is: { cpf: customerCPF }}, 
        }
      }})
      return response.status(200).send({ transfers })
    } catch (error) {
      return response.status(400).send({ message: 'Error in retrieving transfers from this customer.', error: error })
    }
  }
}
