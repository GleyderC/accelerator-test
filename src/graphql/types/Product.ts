import { Ingredients, Product, ProductRecipe, TContext } from "src/types"

const ProductTypeResolver = {

    ingredients: async (_parent: Product, params: any, context: TContext, info: any): Promise<Ingredients[]> => {
        const { prismaClient } = context
        const result: Product = await prismaClient.products.findUnique({ where: { id: _parent.id }, include: { products_recipe: { include: { ingredients: true } } } });
        const ingredients = result.products_recipe.map(pr => pr.ingredients)
        return ingredients;
    },
    recipe: async (_parent: Product, params: any, context: TContext, info: any): Promise<ProductRecipe[]> => {
        const { prismaClient } = context
        const { products_recipe }: Product = await prismaClient.products.findUnique({ where: { id: _parent.id }, include: { products_recipe: { include: { ingredients: true } } } });
        return products_recipe;
    }
}
export default ProductTypeResolver