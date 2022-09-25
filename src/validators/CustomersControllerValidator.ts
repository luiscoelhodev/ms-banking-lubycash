import { Status } from '@prisma/client'
import Joi from 'joi'

const userToCustomerSchema = Joi.object({
  cpf_number: Joi.string().pattern(new RegExp(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)),
  average_salary: Joi.number().min(0),
})

const listAllCustomersSchema = Joi.object({
  status: Joi.string().optional().valid(`${Status.Accepted}`, `${Status.Rejected}`),
  from: Joi.date().optional(),
  to: Joi.date().optional()
})

const getCustomerBankStatementSchema = Joi.object({
  from: Joi.date().optional(),
  to: Joi.date().optional()
})

export { userToCustomerSchema, listAllCustomersSchema, getCustomerBankStatementSchema }
