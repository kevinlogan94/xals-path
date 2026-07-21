using System.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class HelperLogic : MonoBehaviour, IAchievement
{
    public Achievement AchievementObject; 
    public TextMeshProUGUI Title;
    public TextMeshProUGUI RewardDescription;
    public Slider ProgressBar;
    public Image Image;
    public GameObject HelperExclamationPoint;
    
    private AudioManager _audioManager;
    
    // Start is called before the first frame update
    void Start()
    {
        _audioManager = FindObjectOfType<AudioManager>();
        UpdateTitle();
        Image.sprite = AchievementObject.Artwork;
        RewardDescription.text = AchievementObject.RewardDescription;
        ProgressBar.value = 0;
        ProgressBar.maxValue = AchievementManager.Instance.HelperGoal;
        TriggerBarRefresh();
    }

    // Update is called once per frame
    void Update()
    {
        ManageExclamationPoint();
        UpdateTitle();
        UpdateHelperCount();
    }
    
    public void UpdateHelperCount()
    {
        ProgressBar.value = ShopManager.Instance.Helpers.Select(x => x.AmountOwned).Sum();
    }

    public void UpdateTitle()
    {
        Title.text = "Buy " + ProgressBar.maxValue + " Tomes";
    }

    public void Receive()
    {
        if (ProgressBar.value >= ProgressBar.maxValue)
        {
            ProgressBar.maxValue *= 2;
            AchievementManager.Instance.HelperGoal = ProgressBar.maxValue;
            foreach (var helper in ShopManager.Instance.Helpers)
            {
                helper.DynamicIncrement *= 3;
            }
            // Monitor.Instance.UpdatePassiveIncomeText();
            AchievementManager.Instance.TutorialCompleted = true;
            TriggerBarRefresh();
            SplashManager.Instance.TriggerSplash(SplashType.Achievement.ToString(), AchievementObject.Name);
            AchievementManager.Instance.CurrentAchievementAmount++;
            AchievementManager.Instance.PlayAchievementSound();
            GameCenterManager.ReportAchievementUnlocked(GameCenterManager.GameCenterAchievement.Scholar.Value());
        }
    }

    public void ManageExclamationPoint()
    {
        HelperExclamationPoint.SetActive(ProgressBar.value >= ProgressBar.maxValue);
    }
    
    public void TriggerBarRefresh()
    {
        //trigger bar change
        ProgressBar.value--;
        ProgressBar.value++;
    }
}