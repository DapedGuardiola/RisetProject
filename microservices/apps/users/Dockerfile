FROM node:24-slim
WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/users/package.json ./apps/users/
# copy package.json of any other workspace packages users-service depends on

RUN npm install

COPY . .
RUN npm run build --workspace=apps/users

EXPOSE 3004
CMD ["npm", "run", "start:dev", "--workspace=apps/users"]   