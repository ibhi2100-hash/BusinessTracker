import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export const loaders = {

  products: (
    tx: Prisma.TransactionClient,
    aggregateId: string
  ) =>
    tx.product.findUnique({
      where: { id: aggregateId }
    }),

  inventory: (
    tx: Prisma.TransactionClient,
    aggregateId: string
  ) =>
    tx.inventory.findUnique({
      where: { aggregateId }
    }),

  business: (
    tx: Prisma.TransactionClient,
    aggregateId: string
  ) =>
    tx.business.findUnique({
      where: { id: aggregateId }
    }),

  branches: (
    tx: Prisma.TransactionClient,
    aggregateId: string
  ) =>
    tx.branch.findUnique({
      where: { id: aggregateId }
    }),

  sales: (
    tx: Prisma.TransactionClient,
    aggregateId: string
  ) =>
    tx.sale.findUnique({
      where: { id: aggregateId }
    }),
};


export const savers = {

  products: (
    tx: Prisma.TransactionClient,
    state: any
  ) =>
    tx.product.upsert({
      where: { id: state.id },
      create: state,
      update: state
    }),

  business: (
    tx: Prisma.TransactionClient,
    state: any
  ) =>
    tx.business.upsert({
      where: { id: state.id },
      create: state,
      update: state
    }),

  branches: (
    tx: Prisma.TransactionClient,
    state: any
  ) =>
    tx.branch.upsert({
      where: { id: state.id },
      create: state,
      update: state
    }),

  inventory: (
    tx: Prisma.TransactionClient,
    state: any
  ) =>
    tx.inventory.upsert({
      where: { id: state.id },
      create: state,
      update: state
    }),

  sales: (
    tx: Prisma.TransactionClient,
    state: any
  ) =>
    tx.sale.upsert({
      where: { id: state.id },
      create: state,
      update: state
    })
};