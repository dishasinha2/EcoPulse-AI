











FROM node:18

WORKDIR /app

COPY . .
RUN if [ -f package.json ]; then npm install; fi

CMD ["sh", "-c", "if [ -f package.json ] && npm run | grep -q ' dev'; then npm run dev -- --hostname 0.0.0.0 --port 3000; else echo 'No frontend dev server found. Keeping container alive for integration tests.'; tail -f /dev/null; fi"]
