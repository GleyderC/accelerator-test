import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { TContext } from 'src/types';
import Resolvers from '@graphql/index'
async function startServer() {
    const prismaClient: PrismaClient = new PrismaClient()
    const typeDefs = readFileSync('./src/graphql/schema.graphql').toString('utf-8')
    const server = new ApolloServer<TContext>({
        typeDefs,
        resolvers: Resolvers,
    });
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4001 },
        context: async ({ req, res }) => {
            return {
                prismaClient,
                req,
                res
            }
        },
    })
    console.log(`🚀 Server ready at ${url}`);
}
startServer()
