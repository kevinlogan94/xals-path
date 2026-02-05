# Unity 2021.3 LTS Migration Guide

## Overview

This project has been migrated from Unity 2020.3.16f1 to Unity 2021.3 LTS. This guide explains what was changed and what you need to do to complete the setup.

**Note:** Make sure to install the free Unity 2021.3 LTS version (not Extended LTS which requires a paid license).

## Changes Made

### ✅ Completed Automatically

1. **Package Updates**
   - Updated all Unity packages to 2021.3 LTS compatible versions
   - Removed deprecated Unity Ads package
   - Removed deprecated Unity Analytics package
   - Added Unity Gaming Services (Analytics & Core)

2. **Ads System - REMOVED**
   - Deleted `AdvertisementManager.cs` and all ad-related code
   - Removed ATT (App Tracking Transparency) controller
   - Players now automatically receive bonus rewards (no ads required)
   - Level up rewards increased to 3x (previously ad-gated bonus)
   - Buff rewards increased to 30 seconds (previously 15 without ad)

3. **Analytics Migration**
   - Created new `AnalyticsManager.cs` using Unity Gaming Services
   - Migrated all analytics calls from deprecated API to new system
   - All existing analytics events preserved

4. **Save System Modernization**
   - Replaced BinaryFormatter with JSON serialization
   - Added backward compatibility for old save files
   - Auto-converts legacy saves to new JSON format
   - New save location: `XalsPathGame.json` (was `XalsPathGame.data`)

5. **Third-Party Plugins**
   - CloudOnce v2.7.2 - Compatible with 2021.3 LTS
   - Google Play Games Plugin v0.10.12 - Compatible with 2021.3 LTS

## What You Need to Do

### Step 1: Install Unity 2021.3 LTS (Free Version)

1. Open Unity Hub
2. Go to "Installs" tab
3. Click "Install Editor" 
4. Select **Unity 2021.3 LTS** (NOT Extended LTS)
   - Look for Unity 2021.3.XX (latest patch version)
   - Make sure it says "LTS" not "Extended LTS"
5. Make sure to include iOS and Android build support modules
6. Complete the installation

### Step 2: Open Project in Unity 2021.3 LTS

1. In Unity Hub, click "Open" and select this project folder
2. Unity will detect the version upgrade and show a dialog
3. Click "Confirm" to upgrade the project
4. Unity will reimport all assets (this may take 5-10 minutes)
5. If prompted about API updates, click "I Made a Backup. Go Ahead!"

### Step 3: Set Up Unity Gaming Services (Analytics)

Analytics will not work until you complete this setup:

1. **Create/Link UGS Project:**
   - In Unity Editor, go to `Edit -> Project Settings -> Services`
   - Click "Create Unity Project ID" or link to existing project
   - Follow the prompts to create/link your UGS project

2. **Enable Analytics:**
   - Analytics should be automatically enabled after linking
   - Verify in `Project Settings -> Services -> Analytics`

3. **Add AnalyticsManager to Scene:**
   - Open your main scene (`Assets/Scenes/`)
   - Create an empty GameObject named "AnalyticsManager"
   - Add the `AnalyticsManager` component to it
   - This GameObject will persist across scenes

**Note:** If you don't want analytics, you can skip this step. The game will work fine without it.

### Step 4: Verify CloudOnce Settings

1. Go to `Window -> CloudOnce -> Cloud Once Editor`
2. Verify your achievement IDs are still configured
3. Verify Google Play and Game Center settings are intact
4. If needed, re-run the platform setup

### Step 5: Test Builds

#### iOS Build Test:
1. Switch platform to iOS (`File -> Build Settings`)
2. Click "Switch Platform" and wait for reimport
3. Build and test on device or simulator
4. Verify achievements and Game Center integration work

#### Android Build Test:
1. Switch platform to Android (`File -> Build Settings`)
2. Click "Switch Platform" and wait for reimport
3. Build and test on device or emulator
4. Verify achievements and Google Play Games integration work

### Step 6: Test Save System

1. Play the game and make progress
2. Close the game
3. Reopen and verify your progress loaded correctly
4. Check console for "Game loaded successfully from JSON" message

If you have old saves, they should automatically convert:
- Look for "Loading legacy BinaryFormatter save file..." in console
- Old saves will be converted to JSON format automatically

## Potential Issues & Solutions

### Issue: "Could not initialize Unity Gaming Services"

**Solution:** You haven't linked a UGS project yet. Follow Step 3 above.

### Issue: CloudOnce compilation errors

**Solution:** 
1. Delete `Assets/Extensions/CloudOnce/` and `Assets/Extensions/GooglePlayGames/`
2. Reimport from backup or download latest compatible versions
3. Re-run CloudOnce setup

### Issue: Android build fails with AndroidX errors

**Solution:**
1. Go to `Assets -> External Dependency Manager -> Android Resolver -> Settings`
2. Enable "Use Jetifier"
3. Click `Assets -> External Dependency Manager -> Android Resolver -> Force Resolve`

### Issue: iOS build fails with missing frameworks

**Solution:**
1. In Xcode, add `GameKit.framework` to your project
2. Ensure deployment target is iOS 12.0 or higher

## Testing Checklist

Before releasing, test these features:

- [ ] Game launches without errors
- [ ] Click/tap mechanics work
- [ ] Level up system works (check that 3x rewards are given)
- [ ] Shop/helpers can be purchased
- [ ] Achievements unlock (both local and platform)
- [ ] Game saves and loads correctly
- [ ] Story scenes progress correctly
- [ ] Buffs work correctly (30 second duration)
- [ ] Notifications work (iOS and Android)
- [ ] Analytics events are recorded (check UGS dashboard)
- [ ] Game Center integration (iOS)
- [ ] Google Play Games integration (Android)

## Files Modified

### Deleted:
- `Assets/Scripts/Manager/AdvertisementManager.cs`
- `Assets/Scripts/iOS/ATTController.cs`
- `Assets/Scripts/Splash/AdvertisementPanelScript.cs`

### Created:
- `Assets/Scripts/Manager/AnalyticsManager.cs`
- `MIGRATION_GUIDE.md` (this file)

### Modified:
- `Packages/manifest.json` - Updated package versions
- `Assets/Scripts/Manager/SaveGame.cs` - JSON serialization
- `Assets/Scripts/Manager/SavedData.cs` - Removed ad references
- `Assets/Scripts/LevelUp/LevelUp.cs` - Removed ads, updated analytics
- `Assets/Scripts/Splash/BuffPanelScript.cs` - Removed ads
- `Assets/Scripts/Splash/SplashManager.cs` - Removed ads, updated analytics
- `Assets/Scripts/Manager/NotificationManager.cs` - Updated analytics
- `Assets/Scripts/Manager/GameCenterManager.cs` - Updated analytics
- `Assets/Scripts/Manager/BottomNavManager.cs` - Updated analytics
- `Assets/Scripts/Scene/SceneManager.cs` - Updated analytics
- `Assets/Scripts/Shop/ShopManager.cs` - Updated analytics
- `Assets/Scripts/Increment/IncrementPanel.cs` - Updated analytics
- `Assets/Scripts/AnimationEvents/CreatureRegion.cs` - Updated analytics

## Support

If you encounter issues not covered in this guide:

1. Check Unity console for error messages
2. Verify all steps in "What You Need to Do" were completed
3. Check Unity 2021.3 LTS upgrade guide: https://docs.unity3d.com/2021.3/Documentation/Manual/UpgradeGuides.html

## Summary

The migration removes ads entirely (players get bonus rewards automatically), modernizes the analytics and save systems, and updates all packages for Unity 2021.3 LTS compatibility. The core gameplay, achievements, and cloud save functionality remain intact.

**Estimated setup time:** 30-60 minutes (mostly Unity reimporting and UGS setup)

