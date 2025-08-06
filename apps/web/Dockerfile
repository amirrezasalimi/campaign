# Node 20 Alpine for Next.js production runtime (single-stage as requested)
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
# Next.js runtime port
ENV PORT=3001

# System deps (optional)
# RUN apk add --no-cache ...

# Copy manifests first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install only production deps
# Prefer npm; adjust if you use pnpm/yarn in this app
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --prod --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; \
    else npm i --omit=dev; fi

# Copy the rest of the app
COPY . .

# Build Next.js
# This generates the .next build used by "next start"
RUN if [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm run build; \
    elif [ -f yarn.lock ]; then yarn run build; \
    else npm run build; fi

EXPOSE 3001

# Start Next.js server
CMD ["npm", "run", "start"]