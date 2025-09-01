# ---------- Build Stage ----------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
# Use npm ci if lockfile exists, otherwise install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

# ---------- Nginx Stage ----------
FROM nginx:1.27-alpine
# Custom nginx (adds /api proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React production build
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
