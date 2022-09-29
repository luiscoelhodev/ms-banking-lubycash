import { prisma } from "../helpers/PrismaClient";
import { Request, Response } from "express";
import { Customer, Status } from "@prisma/client";
import { getCustomerBankStatementSchema, listAllCustomersSchema, userToCustomerSchema } from '../validators/CustomersControllerValidator'
import { BecomeACustomerErrorsEnum, GetCustomerBankStatementErrorsEnum, ListAllCustomersErrorsEnum } from "../helpers/ErrorsEnums";

export default class CustomersController {
  public async validateUserToBecomeCustomer(request: Request, response: Response) {
    const user = request.body

    try {
      await userToCustomerSchema.validateAsync(user, { abortEarly: false })
    } catch (error) {
      return response.send({ error: BecomeACustomerErrorsEnum.validation })
    }

    const hasUserAlreadyRequested = await prisma.customer.findUnique({ where: { cpf: user.cpf_number }})
    if (hasUserAlreadyRequested) return response.send({ error: BecomeACustomerErrorsEnum.hasAlreadyRequested })

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
      return response.send({ error: BecomeACustomerErrorsEnum.dbInsertionError })
    }

    let customerFound: Customer
    try {
      customerFound = await prisma.customer.findUniqueOrThrow({where: {cpf: user.cpf_number}})
    } catch (error) {
      return response.send({ error: BecomeACustomerErrorsEnum.dbSelect })
    }
    return response.status(201).send({ customerFound })

  }

  public async listAllCustomers(request: Request, response: Response) {
    const {status, from, to} = request.body
    try {
      await listAllCustomersSchema.validateAsync({ status, from, to }, { abortEarly: false })
    } catch (error) {
      return response.send({ error: ListAllCustomersErrorsEnum.validation })
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
      else if (!status && from && to) {
        customers = await prisma.customer.findMany({where: {
          createdAt: {gte: new Date(from), lte: new Date(to)}, 
        }
      })
      } else customers = await prisma.customer.findMany()
    } catch (error) {
      return response.send({ error: ListAllCustomersErrorsEnum.dbSelect })
    }
    return response.status(200).send({ customers })
  }

  public async getCustomerBankStatement(request: Request, response: Response){
    const { from, to } = request.query
    const customerCPF  = request.params.cpf
    let customerFound: Customer

    try {
      await getCustomerBankStatementSchema.validateAsync({ from, to }, { abortEarly: false })
      if (customerCPF.match(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/) === null) throw new Error('CPF is invalid.')
    } catch (error) {
      return response.send({ error: GetCustomerBankStatementErrorsEnum.validation})
    }
    
    try {
      customerFound = await prisma.customer.findUniqueOrThrow({ where: { cpf: customerCPF }})
    } catch (error) {
      return response.send({ error: GetCustomerBankStatementErrorsEnum.notFound })
    }

    if (from && to) {
      try {
        const transfers = await prisma.transfer.findMany({
          where: { 
            OR: [
              {sender: customerFound},
              {receiver: customerFound}
            ],
            createdAt: { gte: new Date(from.toString()), lte: new Date(to.toString())}
          }
        })
        return response.status(200).send({ transfers })
      } catch (error) {
        return response.send({ error: GetCustomerBankStatementErrorsEnum.dbSelect })
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
      return response.status(400).send({ error: GetCustomerBankStatementErrorsEnum.dbSelect })
    }
  }
}
