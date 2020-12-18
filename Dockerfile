### INSTALLER STAGE ###

###
# All images use Debian Buster since the Prisma query engine (made with Rust) can't be compiled for Alpine Linux
# See prisma/prisma#702 https://github.com/prisma/prisma/issues/702
###
FROM node:14.15.3-buster AS installer

# Create app directory
WORKDIR /usr/src/installer

ENV NODE_ENV=production

# Prisma needs to have a schema present because of the postinstall script that generates the SDK
COPY package.json yarn.lock schema.prisma .snyk ./

RUN yarn install --production=true

### BUILDER STAGE ###
FROM node:14.15.3-buster AS builder

# Create app directory
WORKDIR /usr/src/builder

ENV NODE_ENV=production

# Install dependencies and copy Prisma schema
COPY package.json yarn.lock schema.prisma .snyk ./

# Copy dependencies that were installed before
COPY --from=installer /usr/src/installer/node_modules node_modules

# Install the other devdependencies
RUN yarn install --production=false

# Copy build configurations
COPY tsconfig.json ./

# Copy types
COPY types ./types

# Copy source
COPY src ./src

# Build the project
RUN yarn run build

### BOT STAGE ###
FROM node:14.15.3-buster AS bot

LABEL maintainer 'Jonah Snider <jonah@jonah.pw> (jonah.pw)'

WORKDIR /usr/src/dice

ENV NODE_ENV=production

# Top.gg webhook port
EXPOSE 5000

# Install dependencies
COPY --from=installer /usr/src/installer/node_modules ./node_modules
COPY --from=installer /usr/src/installer/yarn.lock ./yarn.lock
COPY --from=installer /usr/src/installer/schema.prisma ./schema.prisma

# Copy other required files
COPY package.json package.json

# Copy compiled TypeScript
COPY --from=builder /usr/src/builder/tsc_output ./tsc_output

ENTRYPOINT ["yarn", "run", "start"]
