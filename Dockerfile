FROM node:20-alpine

# Non-root user — bắt buộc theo rubric
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

RUN chown -R appuser:appgroup /app
USER appuser    

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -O- http://127.0.0.1:8000/health || exit 1

CMD ["node", "src/app.js"]