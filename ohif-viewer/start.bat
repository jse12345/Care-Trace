@echo off
REM ============================================================================
REM  OHIF Viewer - local Orthanc PACS integration launch script
REM
REM  Usage: run start.bat from a cmd window
REM
REM  [How it works]
REM    Browser --> localhost:3000 (OHIF dev server) --> localhost:8042 (Orthanc)
REM
REM    The browser only ever talks to port 3000. Requests to /pacs/dicom-web
REM    are relayed (proxied) by the dev server to Orthanc, so everything is
REM    same-origin and there is no CORS problem. (Orthanc does not handle
REM    OPTIONS requests, so calling :8042 directly from the browser would be
REM    blocked.)
REM
REM    The proxy also attaches Orthanc's Basic auth on the server side, so
REM    orthanc.json's AuthenticationEnabled does not need to be turned off,
REM    and the credentials never reach the browser.
REM
REM  NOTE: keep this file ASCII-only. cmd.exe's mid-script "chcp 65001" +
REM  buffered file read does not reliably decode non-ASCII (e.g. Korean)
REM  comments, and can corrupt parsing of the lines that follow.
REM ============================================================================

cd /d "%~dp0"

REM --- OHIF config file: use Orthanc as the default data source --------------
REM     (if unset, config/dev.js loads and queries the AWS demo server)
set APP_CONFIG=config/local_orthanc.js

REM --- DICOMweb proxy: /pacs/dicom-web -> http://localhost:8042/dicom-web ----
set PROXY_TARGET=http://localhost:3000/pacs/dicom-web
set PROXY_DOMAIN=http://localhost:8042
set PROXY_PATH_REWRITE_FROM=/pacs/dicom-web
set PROXY_PATH_REWRITE_TO=/dicom-web

REM --- Orthanc credentials (used server-side only) ----------------------------
set PROXY_AUTH=admin:1234

echo.
echo  ===========================================================
echo   Starting OHIF Viewer
echo  -----------------------------------------------------------
echo   Config file : %APP_CONFIG%
echo   Orthanc     : %PROXY_DOMAIN%
echo   DICOMweb    : %PROXY_PATH_REWRITE_FROM%  ==^> %PROXY_PATH_REWRITE_TO%
echo   URL         : http://localhost:3000
echo  ===========================================================
echo.

call pnpm run dev
