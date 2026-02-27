# Build
# Obtain variables from env file
FROM node:24-alpine AS builder
# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json* ./
# Install the dependencies
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production
FROM node:24-alpine
# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

USER node
ARG BUILD_APP_PORT
EXPOSE ${BUILD_APP_PORT}

CMD ["node", "dist/index.js"]
