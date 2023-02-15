import { format } from "date-fns";
import { DashboardRequest, DashboardResponse, DashboardResponseAgg, Order, ProductRecipe, TContext } from "src/types";
const DashboardResolver = {
    dashboard: async (_parent: DashboardResponse, params: DashboardRequest, context: TContext): Promise<DashboardResponse | DashboardResponseAgg> => {
        const { start_date, end_date, product_type, aggregation } = params;
        const { prismaClient } = context
        // Search
        const where: any = { AND: [] }
        if (start_date) {
            where.AND.push({ date_created: { gte: new Date(start_date) } })
        }
        if (end_date) {
            where.AND.push({ date_created: { lte: new Date(end_date) } })
        }
        if (product_type) {
            where.AND.push({ product: { name: { in: [...product_type] } } })
        }
        const orders: Order[] = await prismaClient.orders.findMany({
            where,
            include: { product: { include: { products_recipe: { include: { ingredients: true, products: true } } } } },
            orderBy: { date_created: 'asc' }
        });
        // Aggregation
        if (aggregation) {
            const ordersByDates: any = {}
            let dateAggregation: string = null
            const dashboard: DashboardResponseAgg = { sales: 0, ingredients_cost: 0, units_sold: 0, ingredients_used: 0, profit: 0, aggregation: {} }
            for (const order of orders) {
                if (aggregation === 'WEEK') {
                    dateAggregation = format(order.date_created, 'yyyy-w')
                } else if (aggregation === 'MONTH') {
                    dateAggregation = format(order.date_created, 'yyyy-MM')
                } else {
                    dateAggregation = format(order.date_created, 'yyyy-MM-dd')
                }
                if (!ordersByDates[dateAggregation]) {
                    ordersByDates[dateAggregation] = []
                }
                ordersByDates[dateAggregation].push(order)
            }
            const aggregationByDate: { [key: string]: DashboardResponse } = {}
            for (const dateFormat in ordersByDates) {
                aggregationByDate[dateFormat] = ordersByDates[dateFormat].reduce((acc: DashboardResponse, order: Order) => {
                    acc.units_sold += order.quantity;
                    acc.sales += ((parseFloat(order.product.price.toFixed(4)) || 0) * order.quantity);
                    acc.ingredients_used += order.product.products_recipe.reduce((acc: number, ingr: ProductRecipe) => acc += ingr.quantity, 0)
                    acc.ingredients_cost += order.product.products_recipe.reduce((acc: number, productRecipe: any) => {
                        return acc += Math.round((productRecipe.ingredients.price * productRecipe.quantity * order.quantity) * 100) / 100
                    }, 0)
                    return acc
                }, { sales: 0, ingredients_cost: 0, units_sold: 0, ingredients_used: 0, profit: 0 })
                aggregationByDate[dateFormat].ingredients_cost = Math.round(aggregationByDate[dateFormat].ingredients_cost * 100) / 100
                aggregationByDate[dateFormat].profit = Math.round((aggregationByDate[dateFormat].sales - aggregationByDate[dateFormat].ingredients_cost) * 100) / 100
            }
            for (const date in aggregationByDate) {
                dashboard.sales += aggregationByDate[date].sales
                dashboard.ingredients_cost += aggregationByDate[date].ingredients_cost
                dashboard.ingredients_used += aggregationByDate[date].ingredients_used
                dashboard.units_sold += aggregationByDate[date].units_sold
            }
            dashboard.profit = Math.round((dashboard.sales - dashboard.ingredients_cost) * 100) / 100
            dashboard.ingredients_cost = Math.round(dashboard.ingredients_cost * 100) / 100
            dashboard.aggregation = aggregationByDate;
            return dashboard
        } else {
            //
            const dashboard: DashboardResponse = orders.reduce((acc: DashboardResponse, order: Order) => {
                acc.units_sold += order.quantity;
                acc.sales += parseFloat(order.product.price.toFixed(4)) || 0;
                acc.ingredients_used += order.product.products_recipe.reduce((acc: number, ingr: ProductRecipe) => acc += ingr.quantity, 0)
                acc.ingredients_cost += order.product.products_recipe.reduce((acc: number, productRecipe: any) => {
                    return acc += (productRecipe.ingredients.price * productRecipe.quantity)
                }, 0)
                acc.profit = acc.sales - acc.ingredients_cost;
                return acc
            }, { sales: 0, ingredients_cost: 0, units_sold: 0, ingredients_used: 0, profit: 0 })
            dashboard.sales = Math.round(dashboard.sales * 100) / 100
            dashboard.ingredients_cost = Math.round(dashboard.ingredients_cost * 100) / 100
            dashboard.profit = dashboard.sales - dashboard.ingredients_cost
            return dashboard;
        }
    }
}
export default DashboardResolver