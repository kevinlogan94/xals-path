using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
// Removed: using UnityEngine.Analytics - migrated to Unity Gaming Services

//https://docs.unity3d.com/Manual/PlatformDependentCompilation.html
#if UNITY_IOS
using Unity.Notifications.iOS;
#elif UNITY_ANDROID
using Unity.Notifications.Android;
#endif

//https://docs.unity3d.com/Packages/com.unity.mobile.notifications@1.0/manual/index.html#android

public class NotificationManager : MonoBehaviour
{

    private string _iosDeviceToken;
    private bool _iosNotificationPermissionGranted;

    private const string AndroidChannelId = "Default_Channel_Id";

    private const string TitleText = "Hey, Stranger!";
    private const string BodyText = "You have earned a lot of influence while you've been gone! Don't forget to come back and buy more tomes!";

    private const string AndroidTitleText = "You have earned a lot of influence while you've been gone!";
    private const string AndroidBodyText = "Don't forget to come back and buy more tomes!";
    
    #region Singleton
    public static NotificationManager Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion
    
    // Start is called before the first frame update
    void Start()
    {
#if UNITY_ANDROID
                GenerateAndroidNotificationChannelAndScheduleNotification();
#elif UNITY_IOS
        StartCoroutine(RequestAuthorizationAndTriggerNotification());  
#endif
    }

    #region iOS

#if UNITY_IOS
    private void GenerateTimedNotification()
    {
        if (!_iosNotificationPermissionGranted) return;
        
        var scheduledNotifications = iOSNotificationCenter.GetScheduledNotifications();
        if (scheduledNotifications.Length > 0)
        {
            Debug.Log($"Removing Notification: {scheduledNotifications[0].Title}");
            iOSNotificationCenter.RemoveScheduledNotification(scheduledNotifications[0].Identifier);
            Debug.Log("Notification Removed");
            if (Monitor.UseAnalytics)
            {
                AnalyticsManager.RecordEvent("Notification_ReScheduled", new Dictionary<string, object> {{"Device", "iOS"}});
            }
        }
        
        var timeTrigger = new iOSNotificationTimeIntervalTrigger
        {
            TimeInterval = new TimeSpan(10, 0, 0),
            Repeats = false
        };

        var notification = new iOSNotification
        {
            Title = TitleText,
            Body = BodyText,
            ShowInForeground = false, // Don't make it prompt during gameplay
            CategoryIdentifier = "category_a",
            ThreadIdentifier = "thread1",
            Trigger = timeTrigger
        };

        iOSNotificationCenter.ScheduleNotification(notification);
        if (Monitor.UseAnalytics)
        {
            AnalyticsManager.RecordEvent("Notification_Scheduled", new Dictionary<string, object> {{"Device", "iOS"}});
        }
        Debug.Log("Timed Notification Scheduled");
    }

    
    IEnumerator RequestAuthorizationAndTriggerNotification()
    {
        Debug.Log("Request permission for notifications");
        using (var req = new AuthorizationRequest(AuthorizationOption.Alert | AuthorizationOption.Badge, true))
        {
            yield return new WaitForSeconds(5);
            while (!req.IsFinished)
            {
                yield return null;
            }
        
            var res = "\n RequestAuthorization: \n";
            res += "\n finished: " + req.IsFinished;
            res += "\n granted :  " + req.Granted;
            res += "\n error:  " + req.Error;
            res += "\n deviceToken:  " + req.DeviceToken;
            Debug.Log(res);

            if (Monitor.UseAnalytics)
            {
                AnalyticsManager.PushNotificationEnable(new Dictionary<string, object>
                {
                    {"OS", "iOS"}
                });
            }
        
            //store the device token to be used for sending later notifications.
            if (String.IsNullOrEmpty(req.DeviceToken))
            {
                _iosDeviceToken = req.DeviceToken;
                _iosNotificationPermissionGranted = req.Granted;
                GenerateTimedNotification();
            }
        }
    }
#endif
    
    #endregion

    #region Android

#if UNITY_ANDROID
    private void GenerateAndroidNotificationChannelAndScheduleNotification()
    {
        var channel = new AndroidNotificationChannel
        {
            Id = AndroidChannelId,
            Name = "Default Channel",
            Importance = Importance.High,
            Description = "Generic notifications",
        };
        AndroidNotificationCenter.RegisterNotificationChannel(channel);
        GenerateAndroidTimedNotification();
    }

    private void GenerateAndroidTimedNotification()
    {
        var notification = new AndroidNotification
        {
            Title = AndroidTitleText,
            Text = AndroidBodyText,
            SmallIcon = "basic_icon",
            FireTime = DateTime.UtcNow.AddHours(10)
        };
        
        // NOTE: By Default, apps remove scheduled notifications when the device restarts. So, let's always have this trigger on start.
        // This will need to be changed if you toggle on Edit -> Project Settings -> Mobile Notifications -> Android -> Reschedule on Device Restart
        // https://docs.unity3d.com/Packages/com.unity.mobile.notifications@1.0/manual/index.html#android
        if (Monitor.UseAnalytics)
        {
            AnalyticsManager.RecordEvent("Notification_Scheduled", new Dictionary<string, object> {{"Device", "Android"}});
        }
        AndroidNotificationCenter.SendNotification(notification, AndroidChannelId);
        Debug.Log("Timed Notification Scheduled");
    }
#endif
    

    #endregion
}