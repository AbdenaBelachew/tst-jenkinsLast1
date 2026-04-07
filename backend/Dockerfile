FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package management files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port (as defined in index.js or env)
EXPOSE 3001

CMD ["node", "index.js"]
