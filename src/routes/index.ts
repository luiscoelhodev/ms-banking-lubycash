import {Request, Response, Router} from 'express'
import CustomersController from '../controllers/CustomersController'
import TransfersController from '../controllers/TransfersController'
const router = Router()
const customersController = new CustomersController()
const transfersController = new TransfersController()

router.get('/hello', (_request: Request, response: Response) => {
  return response.status(200).send({ hello: 'world'})
})

router.post('/customers/become-a-customer', customersController.validateUserToBecomeCustomer)
router.get('/customers/all', customersController.listAllCustomers)
router.get('/customers/bank-statement/:cpf', customersController.getCustomerBankStatement)
router.post('/transfers/make', transfersController.makeTransferFromSenderToReceiver)

export { router }