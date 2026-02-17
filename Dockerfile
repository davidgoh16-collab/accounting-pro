# Stage 1: Build the application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Node.js
FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets from builder stage
COPY --from=build /app/dist ./dist

# Copy server.js
COPY server.js .

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
