FROM python:3.11-alpine

WORKDIR /app

RUN apk add --no-cache \
    chromium \
    chromium-chromedriver

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]