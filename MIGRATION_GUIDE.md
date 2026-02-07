# Unity 2021.3 LTS Migration Guide

## Overview

This project has been migrated from Unity 2020.3.16f1 to Unity 2021.3 LTS. This guide explains what was changed and what you need to do to complete the setup.

**Note:** Make sure to install the free Unity 2021.3 LTS version (not Extended LTS which requires a paid license).

## Changes Made

### ✅ Completed Automatically

1. **Package Updates**
   - Updated all Unity packages to 2021.3 LTS compatible versions
   - Restored Unity Ads SDK (4.4.2) for optional rewarded ads
   - Added Unity Gaming Services (Analytics & Core)

2. **Ads System - RESTORED (Player-Initiated Only)**
   - Restored `AdvertisementManager.cs` with rewarded ad support
   - Restored `AdvertisementPanelScript.cs` for influence crystal ads
   - Restored `VideoLogic.cs` achievement for watching ads
   - **3 Optional Ad Placements** (all player-initiated):
     - Level up: Skip (1x reward) or Watch ad (3x reward)
     - Buff: Collect (15s) or Watch ad (30s)
     - Influence crystal: Shows 15 min passive income offer
   - **NO forced/automatic ads** - Zero interruptions to gameplay
   - iOS 14+ App Tracking Transparency handled automatically by Unity Ads SDK

3. **Analytics Migration**
   - Created new `AnalyticsManager.cs` using Unity Gaming Services
   - Migrated all analytics calls from deprecated API to new system
   - All existing analytics events preserved

4. **Save System Modernization**
   - Replaced BinaryFormatter with JSON serialization
   - Removed backward compatibility for legacy saves (fresh start)
   - New save location: `XalsPathGame.json`

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

### Step 3: Set Up Unity Ads

Unity Ads is now required for monetization. Complete this setup:

1. **Create Unity Ads Account:**
   - Visit https://dashboard.unity3d.com/
   - Sign in with your Unity account
   - Navigate to "Monetization" section

2. **Get Your Game IDs:**
   - Create a new project or select existing
   - Note your iOS Game ID and Android Game ID
   - Current IDs in code: iOS=3857318, Android=3857319
   - **Update these in `AdvertisementManager.cs` if needed**

3. **Configure Ad Placements:**
   - In Unity Ads dashboard, verify "rewardedVideo" placement exists
   - This is the only placement used (no interstitials/banners)
   - Enable test mode during development

4. **Test Mode:**
   - In `AdvertisementManager.cs`, set `TestMode = true` for testing
   - Set `TestMode = false` before release
   - Test ads will show "Test" watermark

5. **iOS 14+ ATT:**
   - Unity Ads SDK handles App Tracking Transparency automatically
   - First ad request will trigger ATT prompt
   - No additional code needed

### Step 4: Set Up Unity Gaming Services (Analytics)

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

### Step 5: Add AdvertisementManager to Scene

The ads system requires a manager GameObject:

1. Open your main scene (`Assets/Scenes/MainScene`)
2. Create an empty GameObject named "AdvertisementManager"
3. Add the `AdvertisementManager` component to it
4. This GameObject will persist across scenes
5. Verify `TestMode` is set correctly in the component

### Step 6: Verify CloudOnce Settings

1. Go to `Window -> CloudOnce -> Cloud Once Editor`
2. Verify your achievement IDs are still configured
3. Verify Google Play and Game Center settings are intact
4. If needed, re-run the platform setup

### Step 7: Test Builds

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

### Step 8: Test Save System

1. Play the game and make progress
2. Close the game
3. Reopen and verify your progress loaded correctly
4. Check console for "Game loaded successfully from JSON" message

## Potential Issues & Solutions

### Issue: "Unity Ads not initialized" or ads not showing

**Solution:** 
1. Verify Unity Ads SDK is installed (check `Packages/manifest.json`)
2. Confirm AdvertisementManager GameObject exists in scene
3. Check Game IDs are correct in `AdvertisementManager.cs`
4. Enable Test Mode for development testing
5. Verify internet connection is active

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
- [ ] **Ad system works:**
  - [ ] Level up shows both skip and watch ad buttons
  - [ ] Skipping level up gives 1x reward
  - [ ] Watching ad gives 3x reward
  - [ ] Buff panel shows both collect and watch ad buttons
  - [ ] Collecting buff gives 15s duration
  - [ ] Watching ad for buff gives 30s duration
  - [ ] Influence crystal ad offer shows after first chapter viewed
  - [ ] Video achievement tracks ads watched
- [ ] Shop/helpers can be purchased
- [ ] Achievements unlock (both local and platform)
- [ ] Game saves and loads correctly
- [ ] Story scenes progress correctly
- [ ] Notifications work (iOS and Android)
- [ ] Analytics events are recorded (check UGS dashboard)
- [ ] Game Center integration (iOS)
- [ ] Google Play Games integration (Android)

## Files Modified

### Created:
- `Assets/Scripts/Manager/AdvertisementManager.cs` - Rewarded ads only
- `Assets/Scripts/Splash/AdvertisementPanelScript.cs` - Influence crystal ad UI
- `Assets/Scripts/Manager/AnalyticsManager.cs` - UGS Analytics
- `MIGRATION_GUIDE.md` (this file)

### Restored:
- `Assets/Scripts/Achievements/Logic/VideoLogic.cs` - Video achievement
- Unity Ads SDK package in `Packages/manifest.json`

### Modified:
- `Packages/manifest.json` - Added Unity Ads SDK, updated packages
- `Assets/Scripts/Manager/SaveGame.cs` - JSON serialization
- `Assets/Scripts/Manager/SavedData.cs` - Added video achievement tracking
- `Assets/Scripts/LevelUp/LevelUp.cs` - Restored two-path logic (skip vs ad)
- `Assets/Scripts/Splash/BuffPanelScript.cs` - Restored ad integration
- `Assets/Scripts/Splash/SplashManager.cs` - Restored ad panel and triggers
- `Assets/Scripts/Scene/SceneManager.cs` - Restored influence crystal ad
- `Assets/Scripts/Achievements/AchievementManager.cs` - Added video tracking
- `Assets/Scripts/Manager/NotificationManager.cs` - Updated analytics
- `Assets/Scripts/Manager/GameCenterManager.cs` - Updated analytics
- `Assets/Scripts/Manager/BottomNavManager.cs` - Updated analytics
- `Assets/Scripts/Shop/ShopManager.cs` - Updated analytics
- `Assets/Scripts/Increment/IncrementPanel.cs` - Updated analytics
- `Assets/Scripts/AnimationEvents/CreatureRegion.cs` - Updated analytics

## Support

If you encounter issues not covered in this guide:

1. Check Unity console for error messages
2. Verify all steps in "What You Need to Do" were completed
3. Check Unity 2021.3 LTS upgrade guide: https://docs.unity3d.com/2021.3/Documentation/Manual/UpgradeGuides.html

## Summary

The migration restores **optional rewarded ads** (100% player-initiated), modernizes the analytics and save systems, and updates all packages for Unity 2021.3 LTS compatibility. Players can skip all ads and still progress at the original baseline rate, or watch ads for bonus rewards (3x influence, 30s buffs). The core gameplay, achievements, and cloud save functionality remain intact.

**Key Features:**
- ✅ 3 ad placements (level-up, buff, influence crystal) - all optional
- ✅ Zero forced/interrupting ads
- ✅ Players maintain full control over ad viewing
- ✅ Video achievement rewards players who watch ads
- ✅ Original game balance preserved (1x baseline, 3x with ads)

**Estimated setup time:** 45-75 minutes (Unity reimporting, UGS setup, Unity Ads setup)

