# Web3 Security Automation Framework - Docker Image
# Multi-stage build for optimized production image

# Stage 1: Base dependencies
FROM node:20-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Stage 3: Playwright with browsers
FROM mcr.microsoft.com/playwright:v1.40.0-jammy AS playwright

# Set working directory
WORKDIR /app

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Stage 4: Production image
FROM node:20-slim AS production

# Install minimal system dependencies for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Playwright dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    # Additional utilities
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r playwright && useradd -r -g playwright -m playwright

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY playwright.config.ts ./
COPY tsconfig.json ./

# Copy source code
COPY tests/ ./tests/
COPY pages/ ./pages/
COPY fixtures/ ./fixtures/
COPY utils/ ./utils/

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy Playwright browsers
COPY --from=playwright /ms-playwright /ms-playwright

# Set environment variables
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV CI=true
ENV NODE_ENV=test

# Create test results directory
RUN mkdir -p test-results && chown -R playwright:playwright /app

# Switch to non-root user
USER playwright

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Default command: Run all tests
CMD ["npm", "test"]

# Alternative stage for development/debugging
FROM production AS debug

USER root

# Install additional debugging tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    vim \
    nano \
    htop \
    && rm -rf /var/lib/apt/lists/*

USER playwright

# Command for debug mode (keeps container running)
CMD ["tail", "-f", "/dev/null"]

# Labels for metadata
LABEL maintainer="Ricardo Silva <ricardo.silva@example.com>"
LABEL version="1.0.0"
LABEL description="Web3 Security Automation Framework"
LABEL org.opencontainers.image.source="https://github.com/Mendes1982/web3-security-automation"
LABEL org.opencontainers.image.authors="Ricardo Silva"
LABEL org.opencontainers.image.licenses="MIT"
