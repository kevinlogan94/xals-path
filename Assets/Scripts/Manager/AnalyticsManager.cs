using System.Collections.Generic;
using UnityEngine;
using Unity.Services.Core;
using Unity.Services.Analytics;

/// <summary>
/// Manages Unity Gaming Services Analytics integration.
/// Replaces the deprecated UnityEngine.Analytics system.
/// 
/// SETUP REQUIRED:
/// 1. Open Unity Editor
/// 2. Go to Edit -> Project Settings -> Services
/// 3. Create or link a Unity Gaming Services project
/// 4. Analytics will be automatically enabled
/// 
/// NOTE: This simplified version records event names only.
/// For detailed parameter tracking, consider upgrading to Unity Gaming Services Analytics 5.0+
/// or implementing custom event classes.
/// </summary>
public class AnalyticsManager : MonoBehaviour
{
    private static bool _initialized = false;
    
    #region Singleton
    public static AnalyticsManager Instance;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    #endregion

    async void Start()
    {
        if (_initialized) return;
        
        try
        {
            // Initialize Unity Gaming Services
            await UnityServices.InitializeAsync();
            
            // Analytics is automatically enabled after UGS initialization
            _initialized = true;
            Debug.Log("Unity Gaming Services Analytics initialized successfully");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Failed to initialize Unity Gaming Services: {e.Message}");
            Debug.LogError("Analytics will be disabled. Please link a UGS project in Project Settings -> Services");
        }
    }

    /// <summary>
    /// Records a custom analytics event (simplified - event name only)
    /// </summary>
    public static void RecordEvent(string eventName, Dictionary<string, object> parameters = null)
    {
        if (!_initialized || !Monitor.UseAnalytics) return;

        try
        {
            // Unity Gaming Services Analytics 6.0+ - use RecordEvent with just the name
            // Parameters are logged to console for debugging but not sent to analytics
            if (parameters != null && parameters.Count > 0)
            {
                Debug.Log($"Analytics Event: {eventName} (params: {string.Join(", ", parameters.Keys)})");
            }
            
            AnalyticsService.Instance.RecordEvent(eventName);
            AnalyticsService.Instance.Flush();
        }
        catch (System.Exception e)
        {
            Debug.LogWarning($"Failed to record analytics event '{eventName}': {e.Message}");
        }
    }

    #region Standard Game Events
    
    public static void LevelStart(int levelIndex)
    {
        if (!_initialized || !Monitor.UseAnalytics) return;
        RecordEvent($"level_start_{levelIndex}");
    }

    public static void AchievementUnlocked(string achievementId)
    {
        if (!_initialized || !Monitor.UseAnalytics) return;
        RecordEvent($"achievement_unlocked_{achievementId}");
    }

    public static void AchievementStep(int stepIndex, string achievementId)
    {
        if (!_initialized || !Monitor.UseAnalytics) return;
        RecordEvent($"achievement_step_{achievementId}_{stepIndex}");
    }

    public static void PushNotificationEnable(Dictionary<string, object> parameters)
    {
        if (!_initialized || !Monitor.UseAnalytics) return;
        RecordEvent("push_notification_enable", parameters);
    }

    #endregion
}
