using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class LoginLogic : MonoBehaviour, IAchievement
{
    public Achievement AchievementObject; 
    public TextMeshProUGUI Title;
    public TextMeshProUGUI RewardDescription;
    public Slider ProgressBar;
    public Image Image;
    public GameObject LoginExclamationPoint;

    private long _rewardValue;

    // Start is called before the first frame update
    void Start()
    {
        UpdateTitle();
        Image.sprite = AchievementObject.Artwork;
        ProgressBar.value = AchievementManager.Instance.LoginCount;
        ProgressBar.maxValue = AchievementManager.Instance.LoginGoal;
    }

    // Update is called once per frame
    void Update()
    {
        ManageExclamationPoint();
        UpdateProgressValue();
        UpdateRewardCounter();
        UpdateTitle();
    }
    
    private void UpdateProgressValue()
    {
        ProgressBar.value = AchievementManager.Instance.LoginCount;
    }

    public void Receive()
    {
        if (ProgressBar.value >= ProgressBar.maxValue)
        {
            Monitor.Influence += _rewardValue;
            ProgressBar.maxValue++;
            AchievementManager.Instance.TutorialCompleted = true;
            AchievementManager.Instance.LoginGoal = ProgressBar.maxValue;
            TriggerBarRefresh();
            AchievementManager.Instance.CurrentAchievementAmount++;
            SplashManager.Instance.TriggerSplash(SplashType.Achievement.ToString(), AchievementObject.Name);
            AchievementManager.Instance.PlayAchievementSound();
            GameCenterManager.ReportAchievementUnlocked(GameCenterManager.GameCenterAchievement.WelcomeBack.Value());
        }
    }

    private void ManageExclamationPoint()
    {
        LoginExclamationPoint.SetActive(ProgressBar.value >= ProgressBar.maxValue);
    }
    
    private void TriggerBarRefresh()
    {
        ProgressBar.value = ProgressBar.value--;
        ProgressBar.value = ProgressBar.value++;
    }

    public void UpdateTitle()
    {
        Title.text = "Log in for " + ProgressBar.maxValue + " days";
    }

    public void UpdateRewardCounter()
    {
        _rewardValue = Monitor.Instance.GetInfluenceReceivedOverTime(3600); // 1 hour
        RewardDescription.text = AchievementObject.RewardDescription + "\n(" + Monitor.FormatNumberToString(_rewardValue) + " influence)";
    }
}