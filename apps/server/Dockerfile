FROM oven/bun:latest

WORKDIR /app

# 1) Install all deps (so dev-tools like drizzle-kit and tsc are available)
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# 2) Copy your source
COPY . .

# 3) Run codegen & migrations
RUN bun run db:generate && bun run db:migrate

# 4) Compile / bundle into dist/
RUN bun run build

# 5) Prune dev-only deps and leave only production packages
RUN rm -rf node_modules \
    && bun install --frozen-lockfile --production

# 6) Set env and expose
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 7) Runtime: start your compiled server
CMD ["bun", "run", "start"]
