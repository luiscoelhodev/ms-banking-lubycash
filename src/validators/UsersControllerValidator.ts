import Joi from 'joi'

const userToCustomerSchema = Joi.object({
  full_name: Joi.string().pattern(new RegExp(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/)).min(3).max(60).trim(),

  email: Joi.string().email().min(8).max(50),

  phone: Joi.string().pattern(new RegExp(/^\+\d{2}\(\d{2}\)\d{4,5}-\d{4}/)),

  cpf_number: Joi.string().pattern(new RegExp(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)),

  address: Joi.string().max(100).trim(),

  city: Joi.string().trim(),

  state: Joi.string().pattern(new RegExp(/[a-zA-Z][a-zA-Z]/)).max(2).trim().uppercase(),

  zipcode: Joi.string().max(10),

  current_balance: Joi.number().min(0),

  average_salary: Joi.number().min(0),

  status: Joi.string().optional()
})

export { userToCustomerSchema }
