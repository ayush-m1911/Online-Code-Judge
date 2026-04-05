# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose port
EXPOSE 8000

# Run server
CMD python manage.py migrate && python manage.py collectstatic --noinput && gunicorn codejudge.wsgi:application --bind 0.0.0.0:8000