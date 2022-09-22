import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// async function main() {
//     const customer = await prisma.customer.create({data: {
//       cpf: '111.222.333-01',
//       status: 'Approved',
//       balance: 400
//     }})
//     console.log(customer)
// }
async function main() {
 // const transfer = await prisma.transfer.create({data: {amount: 200, sender_id: 2, receiver_id: 2}})
  // const customerInfo = await prisma.customer.findFirst({where: {id: 2}, include: {transfersMade: true}})
  // console.log(customerInfo)
}

main()