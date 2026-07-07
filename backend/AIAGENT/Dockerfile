FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package dependency manifests
COPY package*.json ./

# Install clean production and build dependencies
RUN npm ci

# Copy full application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose Express server port
EXPOSE 5000

# Start Node.js application
CMD ["npm", "start"]
