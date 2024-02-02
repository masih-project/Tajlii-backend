FROM node:18-alpine
ENV NODE_ENV production
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm i --force --production
COPY . .
RUN npm run build
ENTRYPOINT ["npm", "run", "start:prod"]



# # build stage
# FROM node:18-alpine AS build
# WORKDIR /app
# # allows the container to find and execute any command-line tools or scripts installed locally within the node_modules directory of the application
# # ENV PATH /app/node_modules/.bin:$PATH 
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm i --force --production
# COPY . .
# RUN npm run build

# # run stage
# FROM node:18-alpine
# ENV NODE_ENV production
# WORKDIR /app
# COPY --from=build /app/dist /app/dist
# COPY --from=build /app/node_modules /app/node_modules
# COPY package.json .
# ENTRYPOINT ["npm", "run", "start:prod"]