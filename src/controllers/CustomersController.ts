import { prisma } from "../PrismaClient";
import { Request, Response } from "express";
import { Customer, Status } from "@prisma/client";
import { getCustomerBankStatementSchema, listAllCustomersSchema, userToCustomerSchema } from '../validators/CustomersControllerValidator'

export default class CustomersController {
  public async validateUserToBecomeCustomer(request: Request, response: Response) {
    const user = request.body

    try {
      await userToCustomerSchema.validateAsync(user, { abortEarly: false })
    } catch (error: any) {
      return response.status(422).send({ message: 'Validation error.', error: error.details})
    }

    const hasUserAlreadyRequested = await prisma.customer.findUnique({ where: { cpf: user.cpf_number }})
    if (hasUserAlreadyRequested?.cpf) {
      return response.status(406).send({ error: 'You have already requested to become a user!'})
    }

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

  }

  public async listAllCustomers(request: Request, response: Response) {
    const {status, from, to} = request.body
    try {
      await listAllCustomersSchema.validateAsync({ status, from, to }, { abortEarly: false })
    } catch (error) {
      return response.status(422).send({ message: 'Validation error.', error: error})
    }

    let customers: Customer[]
    try {
      if (status && !from && !to) {
        customers = await prisma.customer.findMany({
          where: {
            status: status
          }
        })
      }
      if (!status && from && to) {
        customers = await prisma.customer.findMany({where: {
          createdAt: {gte: new Date(from), lte: new Date(to)}, 
        }
      })
      }
      customers = await prisma.customer.findMany()
    } catch (error) {
      return response.status(400).send({ message: 'Error in listing all customers.', error: error })
    }
    return response.status(200).send({ customers })
  }

  public async getCustomerBankStatement(request: Request, response: Response){
    const { from, to } = request.body
    const customerCPF  = request.params.cpf
    let customerFound: Customer

    try {
      await getCustomerBankStatementSchema.validateAsync({ from, to }, { abortEarly: false })
      if (customerCPF.match(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/) === null) throw new Error('CPF is invalid.')
    } catch (error) {
      return response.status(422).send({ message: 'Validation error.', error: error})
    }
    
    try {
      customerFound = await prisma.customer.findUniqueOrThrow({ where: { cpf: customerCPF }})
    } catch (error) {
      return response.status(404).send({ message: 'Customer not found.', error: error })
    }

    if (from && to) {
      try {
        const transfers = await prisma.transfer.findMany({
          where: { 
            OR: [
              {sender: customerFound},
              {receiver: customerFound}
            ],
            createdAt: { gte: new Date(from), lte: new Date(to)}
          }
        })
        return response.status(200).send({ transfers })
      } catch (error) {
        return response.status(400).send({ message: 'Error in retrieving transfers from this customer.', error: error })
      }
    }

    try {
      const transfers = await prisma.transfer.findMany({
        where: { 
          OR: [
            { sender: customerFound},
            { receiver: customerFound}
          ]
        }
      })
      return response.status(200).send({ transfers })
    } catch (error) {
      return response.status(400).send({ message: 'Error in retrieving transfers from this customer.', error: error })
    }
  }
}
