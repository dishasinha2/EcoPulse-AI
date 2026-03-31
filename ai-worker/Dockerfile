FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install torch pytorch-lightning

CMD ["python","worker.py"]