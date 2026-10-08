@echo off
cd /d "E:\Stahgehand"
echo ================================================================
echo Starting Stagehand AI Studio Web GUI (Desktop + Mobile)
echo ================================================================
echo Desktop URL: http://localhost:3000
echo Check your terminal below for your Phone / Wi-Fi QR Code & Link!
echo ================================================================
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
npm run gui
pause
