using System.Linq;
using UnityEngine;
using UnityEngine.Advertisements;

public class AdvertisementManager : MonoBehaviour, IUnityAdsInitializationListener, IUnityAdsLoadListener, IUnityAdsShowListener
{
    private const string IosGameId = "3857318";
    private const string AndroidGameId = "3857319";
    private const string RewardVideoPlacementId = "rewardedVideo";
    public int FinishedAds = 0;
    public const bool TestMode = false;

    private long _reward;
    private BuffType _buffType;
    private int _buffSeconds;
    private bool _isBuffReward;
    private bool _adLoaded = false;
    
    #region Singleton
    public static AdvertisementManager Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion

    // Start is called before the first frame update
    void Start()
    {
        var gameId = Application.platform == RuntimePlatform.Android ? AndroidGameId : IosGameId;
        Advertisement.Initialize(gameId, TestMode, this);
    }

    public void ShowStandardRewardAd(long reward)
    {
        _reward = reward;
        _isBuffReward = false;
        LoadAndShowAd();
    }

    public void ShowBuffRewardAd(BuffType buffType, int seconds)
    {
        _buffType = buffType;
        _buffSeconds = seconds;
        _isBuffReward = true;
        LoadAndShowAd();
    }

    private void LoadAndShowAd()
    {
        Advertisement.Load(RewardVideoPlacementId, this);
    }

    private void TriggerReward()
    {
        if (_isBuffReward)
        {
            BuffManager.Instance.TriggerBuff(_buffType, _buffSeconds);
        }
        else
        {
            Monitor.Instance.IncrementInfluence(_reward);
        }
    }
    
    // IUnityAdsInitializationListener implementation
    public void OnInitializationComplete()
    {
        Debug.Log("Unity Ads initialization complete.");
    }

    public void OnInitializationFailed(UnityAdsInitializationError error, string message)
    {
        Debug.LogError($"Unity Ads initialization failed: {error} - {message}");
    }

    // IUnityAdsLoadListener implementation
    public void OnUnityAdsAdLoaded(string placementId)
    {
        Debug.Log($"Ad loaded: {placementId}");
        _adLoaded = true;
        
        // Mute background music before showing ad
        AudioManager.Instance.MuteBackgroundMusic(false);
        
        // Show the ad
        Advertisement.Show(placementId, this);
        
        // Log analytics
        if (Monitor.UseAnalytics)
        {
            AnalyticsManager.RecordEvent("AdStart", new System.Collections.Generic.Dictionary<string, object>
            {
                {"rewarded", true}
            });
        }
    }

    public void OnUnityAdsFailedToLoad(string placementId, UnityAdsLoadError error, string message)
    {
        Debug.LogError($"Ad failed to load: {placementId} - {error} - {message}");
        LevelUp.Instance.LevelUpInProgress = false;
        AudioManager.Instance.MuteBackgroundMusic(true);
    }

    // IUnityAdsShowListener implementation
    public void OnUnityAdsShowFailure(string placementId, UnityAdsShowError error, string message)
    {
        Debug.LogError($"Ad failed to show: {placementId} - {error} - {message}");
        LevelUp.Instance.LevelUpInProgress = false;
        AudioManager.Instance.MuteBackgroundMusic(true);
    }

    public void OnUnityAdsShowStart(string placementId)
    {
        Debug.Log($"Ad started: {placementId}");
    }

    public void OnUnityAdsShowClick(string placementId)
    {
        Debug.Log($"Ad clicked: {placementId}");
    }

    public void OnUnityAdsShowComplete(string placementId, UnityAdsShowCompletionState showCompletionState)
    {
        if (placementId == RewardVideoPlacementId)
        {
            if (showCompletionState == UnityAdsShowCompletionState.COMPLETED)
            {
                Debug.Log("Reward the player - ad completed");
                TriggerReward();
                AchievementManager.Instance.CurrentVideoAmount = ++FinishedAds;
                
                if (Monitor.UseAnalytics)
                {
                    AnalyticsManager.RecordEvent("AdComplete", new System.Collections.Generic.Dictionary<string, object>
                    {
                        {"rewarded", true}
                    });
                    AnalyticsManager.RecordEvent("AchievementStep", new System.Collections.Generic.Dictionary<string, object>
                    {
                        {"step", AchievementManager.Instance.CurrentVideoAmount},
                        {"name", "AdsWatched"}
                    });
                }
            }
            else if (showCompletionState == UnityAdsShowCompletionState.SKIPPED)
            {
                Debug.Log("The ad was skipped");
                if (Monitor.UseAnalytics)
                {
                    AnalyticsManager.RecordEvent("AdSkip", new System.Collections.Generic.Dictionary<string, object>
                    {
                        {"rewarded", false}
                    });
                }
            }
        }
        
        // Reset flags and restore audio
        LevelUp.Instance.LevelUpInProgress = false;
        AudioManager.Instance.MuteBackgroundMusic(true);
        _adLoaded = false;
    }
}

