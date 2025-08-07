@echo off
echo 🚀 Setting up Flask ML API Environment...
echo.

REM Install required packages
echo 📦 Installing required packages...
pip install Flask==2.3.3 Flask-CORS==4.0.0 joblib pandas numpy scikit-learn==1.6.1 imbalanced-learn requests

echo.
echo ✅ Setup complete!
echo.
echo 🏃‍♂️ To start the Flask app:
echo    python app.py
echo.
echo 🧪 To test the API:
echo    python test_api.py
echo.
pause
