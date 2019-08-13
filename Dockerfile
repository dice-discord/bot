FROM node:10.16.0-alpine

LABEL maintainer "Jonah Snider <me@jonahsnider.ninja> (jonahsnider.ninja)"

# Create app directory
WORKDIR /usr/src/dice

# Update system packages
RUN apk update
RUN apk upgrade

# Install git, curl, and certificates for the Stackdriver Profiler
RUN apk add --no-cache git curl ca-certificates

# Install PNPM
RUN curl -L https://unpkg.com/@pnpm/self-installer | node

# Install app dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm i

# Bundle app source
COPY . .

# Initialize environment variables
ENV NODE_ENV=production GOOGLE_APPLICATION_CREDENTIALS=/usr/src/dice/googleCloudServiceAccount.json

CMD [ "pnpm", "start" ]
