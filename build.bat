@echo off
SETLOCAL

REM Change working directory to the script's own path
pushd "%~dp0"
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Could not change directory to script path.
    pause
    EXIT /b 1
)

REM Default package manager
SET "PACKAGE_MANAGER=npm"
REM Default server start option
SET "START_SERVER=false"

REM --- Process Command Line Arguments ---
FOR %%a IN (%*) DO (
    IF /I "%%a"=="--pnpm" SET "PACKAGE_MANAGER=pnpm"
    IF /I "%%a"=="-p" SET "PACKAGE_MANAGER=pnpm"
    IF /I "%%a"=="--npm" SET "PACKAGE_MANAGER=npm"
    IF /I "%%a"=="-n" SET "PACKAGE_MANAGER=npm"
    IF /I "%%a"=="--start-server" SET "START_SERVER=true"
    IF /I "%%a"=="-s" SET "START_SERVER=true"
)

REM --- Display selected package manager or prompt if not specified by switch ---
IF NOT "%PACKAGE_MANAGER%"=="pnpm" (
    IF NOT "%PACKAGE_MANAGER%"=="npm" (
        REM If no valid package manager switch was passed, prompt the user
        :CHOOSE_PM
        echo.
        echo Please choose your package manager:
        echo   1. npm (Default)
        2. pnpm
        echo.
        set /p "PM_CHOICE=Enter choice (1 or 2, or just press Enter for npm): "

        IF "%PM_CHOICE%"=="2" (
            SET "PACKAGE_MANAGER=pnpm"
        ) ELSE (
            SET "PACKAGE_MANAGER=npm"
        )
    )
)

echo.
echo Using %PACKAGE_MANAGER% as the package manager.
IF "%START_SERVER%"=="true" (
    echo Server will start automatically after build.
)

REM --- Navigate to site-source directory ---
echo.
echo Navigating to 'site-source' directory...
cd site-source
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Could not change directory to 'site-source'. Make sure it exists relative to the script's path.
    pause
    EXIT /b 1
)

REM --- Install Dependencies if node_modules is not present ---
echo.
IF NOT EXIST "node_modules" (
    echo 'node_modules' folder not found. Running %PACKAGE_MANAGER% install...
    IF "%PACKAGE_MANAGER%"=="npm" (
        call npm install
    ) ELSE (
        call pnpm install
    )
    IF %ERRORLEVEL% NEQ 0 (
        echo Error: %PACKAGE_MANAGER% install failed.
        pause
        EXIT /b 1
    )
) ELSE (
    echo 'node_modules' folder found. Skipping %PACKAGE_MANAGER% install.
)

REM --- Run Build Script ---
echo.
echo Running %PACKAGE_MANAGER% build...
IF "%PACKAGE_MANAGER%"=="npm" (
    call npm run build
) ELSE (
    call pnpm build
)
IF %ERRORLEVEL% NEQ 0 (
    echo Error: %PACKAGE_MANAGER% build failed.
    pause
    EXIT /b 1
)

REM --- Navigate back to project root (which is now the script's path) ---
echo.
echo Navigating back to project root (script's directory)...
cd ..
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Could not change directory back to project root.
    pause
    EXIT /b 1
)

REM --- Run Gradle Tasks ---
echo.
echo Running Gradle compileGwt...
call .\gradlew compileGwt --console verbose --info
IF %ERRORLEVEL% NEQ 0 (
    echo Error: gradlew compileGwt failed.
    pause
    EXIT /b 1
)

echo.
echo Running Gradle makeSite...
call .\gradlew makeSite --console verbose --info
IF %ERRORLEVEL% NEQ 0 (
    echo Error: gradlew makeSite failed.
    pause
    EXIT /b 1
)

echo.
echo All build tasks completed successfully!

REM --- Start HTTP Server if --start-server switch was provided ---
IF "%START_SERVER%"=="true" (
    echo.
    echo Starting HTTP server in 'site' directory on port 8080...
    REM Assume 'site' directory is at the project root (script's path) after gradlew makeSite
    IF EXIST "site" (
        cd site
        IF %ERRORLEVEL% NEQ 0 (
            echo Error: Could not change directory to 'site'.
            pause
            EXIT /b 1
        )
        echo Server running at http://localhost:8080
        echo Press Ctrl+C to stop the server.
        python3 -m http.server 8080
    ) ELSE (
        echo Warning: 'site' directory not found. Cannot start HTTP server.
        echo Make sure 'gradlew makeSite' creates a 'site' directory at the project root.
        pause
    )
) ELSE (
    pause
)

popd
ENDLOCAL