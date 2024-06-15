# backend/Dockerfile
FROM python:3.11

COPY . /app
RUN pip install --no-cache-dir -r app/requirements.txt

EXPOSE 8000
CMD ["python", "-m", "app.main", "--port", "8000"]
