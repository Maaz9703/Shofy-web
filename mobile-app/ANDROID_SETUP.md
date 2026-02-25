# Android SDK Setup Guide

## Quick Fix

Run the setup script in PowerShell:

```powershell
.\setup-android-sdk.ps1
```

## Manual Setup

If the script doesn't work, follow these steps:

### Step 1: Install Android SDK

**Option A: Install Android Studio (Recommended)**
1. Download Android Studio from: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio
4. Go to **More Actions** → **SDK Manager**
5. Install:
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - At least one Android SDK Platform (e.g., Android 14.0)
6. Note the SDK location (usually: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`)

**Option B: Install Command Line Tools Only**
1. Download from: https://developer.android.com/studio#command-tools
2. Extract to a folder (e.g., `C:\Android\Sdk`)
3. Run `sdkmanager` to install required packages

### Step 2: Set Environment Variables

#### Using PowerShell (Current Session Only)
```powershell
$env:ANDROID_HOME = "C:\Users\RT MAAZ\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\RT MAAZ\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

#### Set Permanently (System-wide)
1. Open **System Properties** → **Environment Variables**
2. Under **User variables**, click **New**
3. Add:
   - Variable: `ANDROID_HOME`
   - Value: `C:\Users\RT MAAZ\AppData\Local\Android\Sdk`
4. Add another:
   - Variable: `ANDROID_SDK_ROOT`
   - Value: `C:\Users\RT MAAZ\AppData\Local\Android\Sdk`
5. Edit **Path** variable and add:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

### Step 3: Verify Installation

```powershell
# Check if adb is accessible
adb version

# Check environment variables
echo $env:ANDROID_HOME
```

### Step 4: Restart Terminal

After setting environment variables, **restart your PowerShell/terminal** for changes to take effect.

### Step 5: Run Your App

```powershell
cd mobile-app
npm run android
```

## Troubleshooting

### Error: 'adb' is not recognized
- Make sure `platform-tools` is installed
- Verify `ANDROID_HOME\platform-tools` is in your PATH
- Restart your terminal after setting PATH

### Error: Failed to resolve Android SDK path
- Verify `ANDROID_HOME` is set correctly
- Check that the SDK path exists
- Run `setup-android-sdk.ps1` to auto-detect and configure

### Still having issues?
1. Make sure Android SDK Platform-Tools is installed
2. Verify the SDK path is correct
3. Restart your computer if environment variables don't persist
