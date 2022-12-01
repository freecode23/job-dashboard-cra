FROM node:16.16.0-alpine3.16
WORKDIR /app

# 2. install chrome
# RUN apk update && apk add --no-cache bash \
#     g++ make py3-pip\
#     util-linux\
#     chromium \
#     chromium-chromedriver

# 3. copy the dependency list to container
COPY package.json ./

# 4. install all dependencies
RUN npm i

# 5. copy all current dir to container
COPY . .
CMD ["npm", "run", "start"]