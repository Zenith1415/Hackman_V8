FROM node:18-alpine

WORKDIR /app

# Allow building from repo root or from frontend/ by switching APP_DIR
# - If building with context set to ./frontend: APP_DIR=. (default below)
# - If building from repo root: pass --build-arg APP_DIR=frontend
ARG APP_DIR=.
ENV APP_DIR=${APP_DIR}

# Copy package files and install dependencies reproducibly
COPY ${APP_DIR}/package*.json ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm ci --no-audit --no-fund

# Copy source code
COPY ${APP_DIR}/. .

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