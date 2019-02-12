FROM node:10.15.1-alpine

LABEL maintainer "Jonah Snider <me@jonahsnider.ninja> (jonahsnider.ninja)"

# Create app directory
WORKDIR /usr/src/dice

# Install PNPM
RUN npm -g i pnpm

# Install app dependencies
COPY package.json shrinkwrap.yaml ./
RUN pnpm i

# Bundle app source
COPY . .

# Initialize environment variables
ENV NODE_ENV=production

CMD [ "npm", "start" ]
