import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const customer = await prisma.customer.create({data: {
    cpf: '111.222.333-00',
    status: 'Approved',
    balance: 200
  }})
  console.log(customer)
}

main()