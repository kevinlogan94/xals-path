using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class VideoLogic : MonoBehaviour, IAchievement
{
    public Achievement AchievementObject; 
    public TextMeshProUGUI Title;
    public TextMeshProUGUI RewardDescription;
    public Slider ProgressBar;
    public Image Image;
    public GameObject VideoExclamationPoint;

    private long _rewardValue;
    
    // Start is called before the first frame update
    void Start()
    {
        UpdateTitle();
        Image.sprite = AchievementObject.Artwork;
        ProgressBar.value = AchievementManager.Instance.CurrentVideoAmount;
        ProgressBar.maxValue = AchievementManager.Instance.VideoGoal;
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

    public void UpdateTitle()
    {
        Title.text = "Watch " + ProgressBar.maxValue + " projections";
    }

    public void Receive()
    {
        if (ProgressBar.value >= ProgressBar.maxValue)
        {
            Monitor.Influence += _rewardValue;
            ProgressBar.maxValue *= 2;
            AchievementManager.Instance.TutorialCompleted = true;
            AchievementManager.Instance.VideoGoal = ProgressBar.maxValue;
            TriggerBarRefresh();
            AchievementManager.Instance.CurrentAchievementAmount++;
            SplashManager.Instance.TriggerSplash(SplashType.Achievement.ToString(), AchievementObject.Name);
            AchievementManager.Instance.PlayAchievementSound();
            GameCenterManager.ReportAchievementUnlocked(GameCenterManager.GameCenterAchievement.ThankYou.Value());
        }
    }

    private void UpdateProgressValue()
    {
        ProgressBar.value = AchievementManager.Instance.CurrentVideoAmount;
    }
    
    private void ManageExclamationPoint()
    {
        VideoExclamationPoint.SetActive(ProgressBar.value >= ProgressBar.maxValue);
    }

    private void TriggerBarRefresh()
    {
        ProgressBar.value = ProgressBar.value--;
        ProgressBar.value = ProgressBar.value++;
    }
    
    private void UpdateRewardCounter()
    {
        _rewardValue = Monitor.Instance.GetInfluenceReceivedOverTime(36000); // 10 hour
        RewardDescription.text = AchievementObject.RewardDescription + "\n(" + Monitor.FormatNumberToString(_rewardValue) + " influence)";
    }
}

