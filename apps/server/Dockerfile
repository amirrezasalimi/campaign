# Bun-based production image (single-stage as requested)
FROM oven/bun:latest

WORKDIR /app

# Set production env
ENV NODE_ENV=production
# Default port, can be overridden by compose
ENV PORT=3000

# Copy manifests first for better layer caching
COPY package.json bun.lockb* ./
# Install prod deps only
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .


# Add entrypoint to run generate + migrate then start
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose server port
EXPOSE 3000

# Start: run db:generate and db:migrate before launching server
ENTRYPOINT ["docker-entrypoint.sh"]