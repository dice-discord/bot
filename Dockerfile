FROM node:12.15.0-alpine

LABEL maintainer "Jonah Snider <jonah@jonah.pw> (jonah.pw)"

# Create app directory
WORKDIR /usr/src/dice

# Update system packages
RUN apk update
RUN apk upgrade

# Install git, curl, and certificates for the Stackdriver Profiler
RUN apk add --no-cache git curl ca-certificates yarn

# Install app dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

# Bundle app source
COPY . .

# Initialize environment variables
ENV NODE_ENV=production GOOGLE_APPLICATION_CREDENTIALS=/usr/src/dice/googleCloudServiceAccount.json

CMD [ "yarn", "start" ]
