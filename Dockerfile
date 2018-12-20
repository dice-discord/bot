FROM node:11.5-alpine

LABEL maintainer "Jonah Snider <me@jonahsnider.ninja> (jonahsnider.ninja)"

# Create app directory
WORKDIR /usr/src/dice

# Install Yarn
RUN apk update
RUN apk add yarn

# Install app dependencies
COPY package.json yarn.lock ./
RUN yarn

# Bundle app source
COPY . .

# Initialize environment variables
ENV NODE_ENV=production

CMD [ "yarn", "start" ]
