## Запуск

1. **Клонуйте репозиторій**
   ```bash
   git clone <URL_РЕПОЗИТОРІЮ>
   cd gw_test
   ```

2. **Створіть віртуальне середовище**
   ```bash
   python -m venv venv
   venv\Scripts\Activate.ps1  # Windows PowerShell
   ```

3. **Встановіть залежності**
   ```bash
   pip install -r requirements.txt
   ```

4. **Запустіть проект**
   ```bash
   python manage.py runserver
   ```

5. **Відкрийте браузер**
   
   Перейдіть на http://127.0.0.1:8000/

## Технології1

- **Backend**: Django 5.2.5
- **Frontend**: HTML, CSS, JavaScript
- **Python**: 3.13.3
## API

- `GET /` - Головна сторінка
- `GET /search/?query=<запит>` - Пошук продуктів


# GW Test Task

## Features
- Responsive page built with Django Templates and Tailwind CSS
- Data for slider, categories, and products rendered from backend views
- Hardcoded navigation menu
- Debounced server-side product search using existing backend API
- Favorites with localStorage persistence
- Hero slider with autoplay and manual navigation
- Product tabs filtering with animated transitions
- Mobile menu and mobile search
- Smooth UI animations and hover effects

## Tech Stack
- Django
- Django Templates
- JavaScript
- Tailwind CSS (without CDN)

## Run project
1. Create virtual environment
2. Install Python dependencies
3. Start Django server
4. Run Tailwind CLI build/watch