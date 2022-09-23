import { Customer } from "@prisma/client"
import { Request, Response } from "express"
import { prisma } from "../PrismaClient"
import { transferSchema } from "../validators/TransfersControllerValidator"

export default class TransfersController {

  public async makeTransferFromSenderToReceiver(request: Request, response: Response) {
    const { amount, message, senderCPF, receiverCPF } = request.body

    if (senderCPF === receiverCPF) {
      return response.status(400).send({ error: 'senderCPF and receiverCPF cannot be equal!' })
    }

    try {
      await transferSchema.validateAsync({amount, message, senderCPF, receiverCPF}, { abortEarly: false })
    } catch (error) {
      return response.status(422).send({ message: 'Validation error.', error: error })
    }

    let senderFound: Customer
    let receiverFound: Customer
    try {
      senderFound = await prisma.customer.findUniqueOrThrow({where: { cpf: senderCPF }})
    } catch (error) {
      return response.status(404).send({ message: 'Sender not found.', error: error })
    }
    try {
      receiverFound = await prisma.customer.findUniqueOrThrow({where: { cpf: receiverCPF}})
    } catch (error) {
      return response.status(404).send({ message: 'Receiver not found.', error: error })
    }

    if (amount > senderFound.balance) {
      return response.status(400).send({ error: 'Customer does not have enough money for this transfer!' })
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
      return response.status(400).send({ message: 'Error in making transfer.', error: error })
    }
    return response.status(200).send({ message: 'Transfer completed successfully!' })
  }
  
}