import { prisma } from "../../infrastructure/postgresql/prismaClient.js"

async function postLedgerEntry(
  businessId: string,
  debitAccount: string,
  creditAccount: string,
  amount: number
) {

  await prisma.$transaction([

    prisma.ledgerEntry.create({
      data:{
        businessId,
        accountId: debitAccount,
        amount,
        type:"DEBIT"
      }
    }),

    prisma.ledgerEntry.create({
      data:{
        businessId,
        accountId: creditAccount,
        amount,
        type:"CREDIT"
      }
    })

  ])

}