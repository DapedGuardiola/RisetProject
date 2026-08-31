FROM node:24-slim
WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/api/package.json ./apps/api/
# copy package.json of any other workspace packages api-service depends on

RUN npm install

COPY . .
RUN npm run build --workspace=apps/api

EXPOSE 3006
CMD ["npm", "run", "start:dev", "--workspace=apps/api"]   