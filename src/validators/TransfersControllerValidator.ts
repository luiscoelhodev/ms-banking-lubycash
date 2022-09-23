import Joi from 'joi'

const transferSchema = Joi.object({
  amount: Joi.number().min(0.01),
  message: Joi.string().optional(),
  senderCPF: Joi.string().pattern(new RegExp(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)),
  receiverCPF: Joi.string().pattern(new RegExp(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/))
})

export { transferSchema }