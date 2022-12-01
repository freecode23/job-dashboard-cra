FROM node:16.16.0-alpine3.16 as builder
WORKDIR /app

# 2. copy dependency to container
COPY package.json .

# 3. incase of websocket error
RUN npm cache clear --force

# 4. install all dependencies
RUN npm install -g npm@9.1.3

# 5. copy all current dir to container
COPY . .
COPY create-env-file.sh ./create-env-file.sh


# 6. env argument that will be injected from docker-compose
ARG REACT_APP_GOOGLE_API

# - create env variable with the injected argument from docker compose
RUN sh create-env-file.sh REACT_APP_GOOGLE_API=$REACT_APP_GOOGLE_API

# debug
CMD ["cat", ".env"]

# 7. dev
# CMD ["npm", "run", "start"] 


# 7. production
RUN npm run build
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html