import { products } from "@prisma/client"
import { TContext } from "src/types"

const ProductQueryResolver = {
    products: async (_parent: any, params: any, context: TContext): Promise<products[]> => {
        const { prismaClient } = context
        return await prismaClient.products.findMany()
    },
    product: async (_parent: any, { id }: any, context: TContext): Promise<products> => {
        const { prismaClient, req } = context
        return prismaClient.products.findUnique({ where: { id } })
    }
}
export default ProductQueryResolver