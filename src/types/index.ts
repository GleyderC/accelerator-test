

import { orders, products, products_recipe, ingredients, PrismaClient } from "@prisma/client";

export type TContext = {
    // Context typing
    prismaClient: PrismaClient
    req: any,
    res: any
}
/**
 * Model
 */
export type Ingredients = ingredients

export type ProductRecipe = products_recipe & { ingredients: ingredients, products?: products }

export type Product = products & { products_recipe: ProductRecipe[] }

export type Order = orders & { product: Product }

/** GraphQL */
export type AggregationType = 'WEEK' | 'MONTH' | 'DAY'

export type DashboardResponse = {
    sales: number,
    ingredients_used: number
    units_sold: number
    ingredients_cost: number
    profit: number;
}
export type DashboardResponseAgg = DashboardResponse & {
    aggregation?: {
        [key: string]: DashboardResponse
    }
}
export type DashboardRequest = {
    start_date: string
    end_date: string
    product_type: string[]
    aggregation: AggregationType
}