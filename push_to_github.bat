@echo off
echo ================================================
echo Pushing FYP project to GitHub!
echo ================================================
echo.

cd /d "%~dp0"

echo [1/4] Configuring Git...
git config user.name "Shamir101"
git config user.email "shamir101@users.noreply.github.com"

echo [2/4] Initializing Repository...
git init
git add .
git commit -m "Initialize Customer Churn FYP"

echo [3/4] Setting Branch and Remote...
git branch -M main
git remote add origin https://github.com/Shamir101/customer-churn-fyp.git

echo [4/4] Uploading to GitHub... (A login window should pop up!)
git push -u origin main

echo.
echo All done! You can close this window now.
pause
