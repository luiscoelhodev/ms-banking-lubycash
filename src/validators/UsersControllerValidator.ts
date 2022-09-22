import Joi from 'joi'

const userToCustomerSchema = Joi.object({
  cpf_number: Joi.string().pattern(new RegExp(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)),
  average_salary: Joi.number().min(0),
})

export { userToCustomerSchema }
