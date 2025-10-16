FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Only build-time public variables
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_PAYMENT_URL

ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_PAYMENT_URL=$NEXT_PUBLIC_PAYMENT_URL

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]