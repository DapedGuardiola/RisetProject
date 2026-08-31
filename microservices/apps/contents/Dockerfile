FROM node:24-slim
WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/contents/package.json ./apps/contents/
# copy package.json of any other workspace packages users-service depends on

RUN npm install

COPY . .
RUN npm run build --workspace=apps/contents

EXPOSE 3005
CMD ["npm", "run", "start:dev", "--workspace=apps/contents"]