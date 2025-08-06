FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package.json package-lock.json ./

# Copy source and build
COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start"]