### INSTALLER STAGE ###
FROM node:14.16.1-alpine AS installer

# Create app directory
WORKDIR /usr/src/installer

ENV NODE_ENV=production

# Prisma needs to have a schema present because of the postinstall script that generates the SDK
COPY package.json yarn.lock .yarnrc.yml schema.prisma .snyk ./
COPY .yarn ./.yarn

# Install build tools for native dependencies
RUN apk add --no-cache make=4.2.1-r2 gcc=9.3.0-r0 g++=9.3.0-r0 python3=3.8.2-r2
RUN yarn install --immutable

### BUILDER STAGE ###
FROM node:14.16.1-alpine AS builder

# Create app directory
WORKDIR /usr/src/builder

ENV NODE_ENV=production

# Install dependencies and copy Prisma schema
COPY package.json yarn.lock .yarnrc.yml schema.prisma .snyk ./

# Copy dependencies that were installed before
COPY --from=installer /usr/src/installer/node_modules node_modules
# Copy build configurations
COPY tsconfig.json ./

# Copy types
COPY types ./types

# Copy Yarn release
COPY .yarn/releases ./.yarn/releases

# Copy source
COPY src ./src

# Build the project
RUN yarn run build

### BOT STAGE ###
FROM node:14.16.1-alpine AS bot

LABEL maintainer 'Jonah Snider <jonah@jonah.pw> (jonah.pw)'

WORKDIR /usr/src/dice

ENV NODE_ENV=production

# Top.gg webhook port
EXPOSE 5000

# Install dependencies
COPY --from=installer /usr/src/installer/node_modules ./node_modules
COPY --from=installer /usr/src/installer/yarn.lock ./yarn.lock
COPY --from=installer /usr/src/installer/.yarn/releases ./.yarn/releases
COPY --from=installer /usr/src/installer/.yarnrc.yml ./.yarnrc.yml
COPY --from=installer /usr/src/installer/schema.prisma ./schema.prisma

# Copy other required files
COPY package.json package.json

# Copy compiled TypeScript
COPY --from=builder /usr/src/builder/tsc_output ./tsc_output

ENTRYPOINT ["yarn", "run", "start"]
