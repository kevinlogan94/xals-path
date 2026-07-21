using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class AppStoreReviewLogic : MonoBehaviour, IAchievement
{
    public Achievement AchievementObject; 
    public TextMeshProUGUI Title;
    public TextMeshProUGUI RewardDescription;
    public Slider ProgressBar;
    public Image Image;
    
    private const string AndroidAppStoreReviewUrl = "https://play.google.com/store/apps/details?id=com.IntrigueGames.XalsPath";
    private const string IosAppStoreReviewUrl = "https://apps.apple.com/us/app/xals-path/id1566474908";
    private const string SurveyUrl = "https://www.surveymonkey.com/r/F9SWS9P";
    
    private long _rewardValue;
    
    // Start is called before the first frame update
    void Start()
    {
        UpdateTitle();
        Image.sprite = AchievementObject.Artwork;
        RewardDescription.text = AchievementObject.RewardDescription;
        ProgressBar.value = AchievementManager.Instance.AppStoreReviewed ? AchievementManager.ShareGoal : 0;
        ProgressBar.maxValue = AchievementManager.ShareGoal;
        TriggerBarRefresh();
    }

    void Update()
    {
        UpdateRewardCounter();
    }

    public void UpdateTitle()
    {
        Title.text = "Write a Review";
    }

    public void Receive()
    {
        if (ProgressBar.value == 0)
        {
            Monitor.Influence += _rewardValue;
            ProgressBar.value = AchievementManager.ShareGoal;
            AchievementManager.Instance.AppStoreReviewed = true;
            if (Monitor.useBetaFeatures)
            {
                Application.OpenURL(SurveyUrl);
            }
            else
            {
                if (Application.platform == RuntimePlatform.Android)
                {
                    Debug.Log("Android App Store Review Prompt");
                    Application.OpenURL(AndroidAppStoreReviewUrl);
                }
                else
                {
                    Debug.Log("Apple App Store Review Prompt");
                    Application.OpenURL(IosAppStoreReviewUrl);
                }  
            }

            AchievementManager.Instance.CurrentAchievementAmount++;
            SplashManager.Instance.TriggerSplash(SplashType.Achievement.ToString(), AchievementObject.Name);
            AchievementManager.Instance.PlayAchievementSound();
            TriggerBarRefresh();
            GameCenterManager.ReportAchievementUnlocked(GameCenterManager.GameCenterAchievement.Appraiser.Value());
        }
    }
    public void TriggerBarRefresh()
    {
        //trigger bar change
        ProgressBar.maxValue++;
        ProgressBar.maxValue--;
    }
    
    public void UpdateRewardCounter()
    {
        _rewardValue = Monitor.Instance.GetInfluenceReceivedOverTime(3600); // 1 hour
        RewardDescription.text = AchievementObject.RewardDescription + "\n(" + Monitor.FormatNumberToString(_rewardValue) + " influence)";
    }
}
