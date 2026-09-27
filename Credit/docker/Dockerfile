FROM python:3.14.0-slim
LABEL authors="Adam Hanna"

WORKDIR /api

COPY ./requirements.txt ./requirements.txt
RUN pip install -r requirements.txt
COPY . .

EXPOSE 8000

CMD ["uvicorn", "account:app", "--host", "0.0.0.0", "--port", "8000"]