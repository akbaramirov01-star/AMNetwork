FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Every module api.py imports must be listed here. Miss one and the container
# dies on startup with ModuleNotFoundError — which is exactly what happened
# when assistant.py was left out.
COPY scorer.py api.py assistant.py academy.py security.py ./
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "1", "--threads", "8", "--timeout", "60", "api:app"]
