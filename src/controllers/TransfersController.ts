import { Customer } from "@prisma/client"
import { Request, Response } from "express"
import { TransferErrorsEnum } from "../helpers/ErrorsEnums"
import { prisma } from "../helpers/PrismaClient"
import { transferSchema } from "../validators/TransfersControllerValidator"

export default class TransfersController {

  public async makeTransferFromSenderToReceiver(request: Request, response: Response) {
    const { amount, message, senderCPF, receiverCPF } = request.body

    if (senderCPF === receiverCPF) {
      return response.send({ error: TransferErrorsEnum.equalCpfs })
    }

    try {
      await transferSchema.validateAsync({amount, message, senderCPF, receiverCPF}, { abortEarly: false })
    } catch (error) {
      return response.send({ error: TransferErrorsEnum.validation })
    }

    let senderFound: Customer
    let receiverFound: Customer
    try {
      senderFound = await prisma.customer.findUniqueOrThrow({where: { cpf: senderCPF }})
    } catch (error) {
      return response.send({ error: TransferErrorsEnum.senderNotFound })
    }

    try {
      receiverFound = await prisma.customer.findUniqueOrThrow({where: { cpf: receiverCPF}})
    } catch (error) {
      return response.send({ error: TransferErrorsEnum.receiverNotFound })
    }

    if (amount > senderFound.balance) {
      return response.send({ error: TransferErrorsEnum.notEnoughMoney })
    }

    try {
      await prisma.transfer.create({data: {
        amount: amount,
        message: message,
        sender_id: senderFound.id,
        receiver_id: receiverFound.id,
      }})
      await prisma.customer.update({ where: { cpf: senderFound.cpf }, data: { balance: { decrement: amount }}})
      await prisma.customer.update({where: { cpf: receiverFound.cpf}, data: { balance: { increment: amount }}})
    } catch (error) {
      return response.send({ error: TransferErrorsEnum.dbInsertion })
    }
    return response.status(200).send({ message: 'Transfer completed successfully!' })
  }
  
}