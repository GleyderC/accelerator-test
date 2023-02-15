FROM node:14.21.1 as builder
WORKDIR /app
COPY . ./
RUN npm install prisma
RUN npm install --only=production

FROM node:14.21.1

RUN npx prisma generate --schema=/app/prisma/schema.prisma
# RUN npx prisma db push --schema=/app/prisma/schema.prisma
COPY prisma/insert.sql .
COPY prisma/initdb.sh .
RUN chmod +x initdb.sh
EXPOSE 80
CMD ["npm","start"]