using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class AchievementLogic : MonoBehaviour, IAchievement
{
    public Achievement AchievementObject; 
    public TextMeshProUGUI Title;
    public TextMeshProUGUI RewardDescription;
    public Slider ProgressBar;
    public Image Image;
    public GameObject RewardExclamationPoint;
    
    private long _rewardValue;
    
    // Start is called before the first frame update
    void Start()
    {
        UpdateTitle();
        Image.sprite = AchievementObject.Artwork;
        RewardDescription.text = AchievementObject.RewardDescription;
        ProgressBar.value = AchievementManager.Instance.CurrentAchievementAmount;
        ProgressBar.maxValue = AchievementManager.Instance.AchievementGoal;
        TriggerBarRefresh();
    }

    // Update is called once per frame
    void Update()
    {
        UpdateTitle();
        UpdateRewardCounter();
        ManageExclamationPoint();
        UpdateProgressValue();
    }
    
    private void UpdateProgressValue()
    {
        ProgressBar.value = AchievementManager.Instance.CurrentAchievementAmount;
    }

    public void UpdateTitle()
    {
        Title.text = "Earn " + ProgressBar.maxValue + " Rewards";
    }

    public void Receive()
    {
        if (ProgressBar.value >= ProgressBar.maxValue)
        {
            AchievementManager.Instance.PlayAchievementSound();
            Monitor.Influence += _rewardValue;
            ProgressBar.maxValue *= 2;
            AchievementManager.Instance.TutorialCompleted = true;
            AchievementManager.Instance.AchievementGoal = ProgressBar.maxValue;
            TriggerBarRefresh();
            AchievementManager.Instance.CurrentAchievementAmount++;
            SplashManager.Instance.TriggerSplash(SplashType.Achievement.ToString(), AchievementObject.Name);
            GameCenterManager.ReportAchievementUnlocked(GameCenterManager.GameCenterAchievement.Collector.Value());
        }
    }
    
    private void ManageExclamationPoint()
    {
        if (ProgressBar.value >= ProgressBar.maxValue)
        {
            RewardExclamationPoint.SetActive(true);
        }
        else
        {
            RewardExclamationPoint.SetActive(false);
        }
    }
    
    private void TriggerBarRefresh()
    {
        ProgressBar.value = ProgressBar.value--;
        ProgressBar.value = ProgressBar.value++;
    }

    private void UpdateRewardCounter()
    {
        _rewardValue = Monitor.Instance.GetInfluenceReceivedOverTime(3600); // 1 hour
        RewardDescription.text = AchievementObject.RewardDescription + "\n(" + Monitor.FormatNumberToString(_rewardValue) + " influence)";
    }
}
