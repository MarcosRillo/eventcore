FROM node:20.18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production --omit=dev

# Copiar código fuente
COPY . .

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Cambiar propietario de los archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto 3000
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando por defecto
CMD ["npm", "run", "dev"]
