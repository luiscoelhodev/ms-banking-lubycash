import {Request, Response, Router} from 'express'
import CustomersController from '../controllers/CustomersController'
const router = Router()
const customersController = new CustomersController()

router.get('/hello', (_request: Request, response: Response) => {
  return response.status(200).send({ hello: 'world'})
})

router.post('/become-a-customer', customersController.validateUserToBecomeCustomer)
router.get('/customers/all', customersController.listAllCustomers)
router.get('/customers/bank-statement/:cpf', customersController.getCustomersBankStatement)
router.post('/customers/transfer', customersController.makeTransferFromSenderToReceiver)


export { router }