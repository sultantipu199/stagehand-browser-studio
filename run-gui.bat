@echo off
title Stagehand AI Studio - Auto Browser Assistant
cd /d "%~dp0"

echo ================================================================
echo   STAGEHAND এআই ব্রাউজার স্টুডিও (AI Browser Studio)
echo ================================================================
echo   সার্ভার চালু হচ্ছে, অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...
echo ================================================================

:: Check if server is already running on port 3000
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/status' -UseBasicParsing -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo   সার্ভার ইতিমধ্যে চালু আছে! ব্রাউজার ওপেন করা হচ্ছে...
    start "" "http://localhost:3000"
    goto keepalive
)

:: Start server in background
echo   এআই ইঞ্জিন এবং ক্লাউডফ্লেয়ার টানেল লোড হচ্ছে...
start /b cmd /c "npm run gui"

:: Wait until port 3000 responds 200 OK before opening browser
powershell -NoProfile -Command "$ready = $false; for ($i=0; $i -lt 30; $i++) { Start-Sleep -Milliseconds 1000; try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/status' -UseBasicParsing -TimeoutSec 1; if ($r.StatusCode -eq 200) { $ready = $true; break } } catch {} }; if ($ready) { exit 0 } else { exit 1 }"

if %ERRORLEVEL% EQU 0 (
    echo   সার্ভার সফলভাবে চালু হয়েছে! ব্রাউজার ওপেন করা হচ্ছে...
    start "" "http://localhost:3000"
) else (
    echo   সার্ভার চালু হতে দেরি হচ্ছে, অনুগ্রহ করে ব্রাউজারে http://localhost:3000 ওপেন করুন।
)

:keepalive
echo ================================================================
echo   লাইভ টার্মিনাল ও ক্লাউডফ্লেয়ার টানেল নিচে চলছে।
echo   অ্যাপ্লিকেশনটি বন্ধ করতে চাইলে এই উইন্ডোটি কেটে দিন।
echo ================================================================
pause
