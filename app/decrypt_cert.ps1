# Define input and output file paths
$inputFile = "cert.pfx.enc"
$outputFile = "cert.pfx"

# Check if the input file exists
if (-not (Test-Path $inputFile)) {
    Write-Error "Error: Input file '$inputFile' not found."
    exit 1
}

# Define the maximum number of decryption attempts
$maxRetries = 5
$attempt = 0
$decryptionSuccessful = $false

# Loop to allow multiple decryption attempts
do {
    $attempt++
    Write-Host "Attempting Certificate decryption (Attempt $attempt of $maxRetries)..."

    # Prompt the user for the password securely
    # The -AsSecureString converts the input into a System.Security.SecureString object,
    # which stores sensitive information in memory as encrypted text.
    $password = Read-Host -Prompt "Enter the password for decryption" -AsSecureString

    # Convert the secure string to a plain string for openssl
    # NOTE: Using plain text passwords in scripts can be a security risk.
    # This approach is necessary for openssl's 'pass:' argument.
    # We explicitly clean up the plain string from memory as soon as possible.
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

    # Construct the openssl command with the password
    # The 'pass:' prefix is important for openssl to treat the argument as a literal password.
    $opensslCommand = "& 'openssl' 'aes-256-cbc' '-d' '-pbkdf2' '-in' '$inputFile' '-out' '$outputFile' '-pass' 'pass:$plainPassword'"

    # Execute the openssl command
    # -ErrorAction SilentlyContinue is used to prevent PowerShell from throwing an error
    # when openssl fails, allowing us to check $LASTEXITCODE for openssl's specific exit code.
    Invoke-Expression $opensslCommand -ErrorAction SilentlyContinue

    # Get the exit code of the last executed external program (openssl)
    # An exit code of 0 typically indicates success.
    $exitCode = $LASTEXITCODE

    # Clean up the plain password from memory as soon as possible
    # This helps reduce the time the plain password resides in memory.
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    $plainPassword = $null # Explicitly nullify the variable

    # Check if the decryption was successful based on openssl's exit code
    if ($exitCode -eq 0) {
        Write-Host "Decryption successful! Output file '$outputFile' created."
        $decryptionSuccessful = $true # Set flag to exit the loop
    } else {
        Write-Warning "Decryption failed (Exit Code: $exitCode). The password might be incorrect."
        Write-Warning "Please contact amitnandileo@gmail.com for password issues." # Added email contact
        # If decryption failed, openssl might create an empty or corrupted file.
        # We remove it to ensure the output file only exists upon successful decryption.
        if (Test-Path $outputFile) {
            Remove-Item $outputFile -Force -ErrorAction SilentlyContinue
            Write-Warning "Removed '$outputFile' because decryption failed."
        }

        # If maximum attempts are reached, inform the user and provide contact information
        if ($attempt -ge $maxRetries) { # Changed from -lt to -ge to catch the last attempt
            Write-Error "Maximum decryption attempts ($maxRetries) reached. Exiting."
            Write-Error "Please contact amitnandileo@gmail.com for password issues." # Added email contact
        }
        # The loop will automatically continue to the next attempt if maxRetries not reached
    }

} while (-not $decryptionSuccessful -and $attempt -lt $maxRetries)

# Final exit status of the script
# If decryption was not successful after all attempts, exit with an error code.
if (-not $decryptionSuccessful) {
    exit 1
}
