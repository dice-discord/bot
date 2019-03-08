FROM node:10.15.3-alpine

LABEL maintainer "Jonah Snider <me@jonahsnider.ninja> (jonahsnider.ninja)"

# Create app directory
WORKDIR /usr/src/dice

# Update system packages
RUN apk update
RUN apk upgrade

# Install git
RUN apk add --no-cache git

# Install PNPM
RUN npm -g i pnpm

# Install app dependencies
COPY package.json shrinkwrap.yaml ./
RUN pnpm i

# Bundle app source
COPY . .

# Initialize environment variables
ENV NODE_ENV=production

CMD [ "pnpm", "start" ]
