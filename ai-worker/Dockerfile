FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir redis

CMD ["python","worker.py"]