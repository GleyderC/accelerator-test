import DashboardQuery from '@graphql/queries/Dashboard'
import ProductQueryResolver from '@graphql/queries/Product';
import ProductTypeResolver from './types/Product';

const Query = {
    ...DashboardQuery,
    ...ProductQueryResolver
}
// const Mutation = {
// }
export default {
    Query,
    // Mutation,
    Product: { ...ProductTypeResolver }
}