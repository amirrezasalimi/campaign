FROM node:20-alpine

WORKDIR /app

# Build from repository root context so shared/* is included.
# Install ALL dependencies for build, then prune to production after build.
ENV PORT=3001

# Copy manifest(s) and install all deps (including dev) needed for build
COPY package.json ./
# If you have lockfile (package-lock.json), copy it as well for reproducible builds
# COPY package-lock.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Prune devDependencies to slim final image
ENV NODE_ENV=production
RUN npm prune --production

EXPOSE 3001
CMD ["npm", "run", "start"]