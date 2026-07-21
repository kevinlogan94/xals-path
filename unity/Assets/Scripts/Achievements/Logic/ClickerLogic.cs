using System.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class ClickerLogic : MonoBehaviour, IAchievement
{
    public Achievement AchievementObject; 
    public TextMeshProUGUI Title;
    public TextMeshProUGUI RewardDescription;
    public Slider ProgressBar;
    public Image Image;
    public GameObject ClickerExclamationPoint;
    public const int ClickerIncrease = 15;

    // Start is called before the first frame update
    void Start()
    {
        UpdateTitle();
        Image.sprite = AchievementObject.Artwork;
        RewardDescription.text = AchievementObject.RewardDescription;
        ProgressBar.value = 0;
        ProgressBar.maxValue = AchievementManager.Instance.ClickerGoal;
        TriggerBarRefresh();
    }

    // Update is called once per frame
    void Update()
    {
        ManageExclamationPoint();
        UpdateTitle();
        UpdateProgressValue();
    }

    public void UpdateProgressValue()
    {
        ProgressBar.value = IncrementPanel.ClickCount;
    }

    public void UpdateTitle()
    {
        Title.text = "Cast " + ProgressBar.maxValue + " spells";
    }

    public void Receive()
    {
        if (ProgressBar.value >= ProgressBar.maxValue)
        {
            IncrementPanel.ClickerIncrement *= ClickerIncrease;
            ProgressBar.maxValue *= 2;
            AchievementManager.Instance.TutorialCompleted = true;
            AchievementManager.Instance.ClickerGoal = ProgressBar.maxValue;
            TriggerBarRefresh();
            SplashManager.Instance.TriggerSplash(SplashType.Achievement.ToString(), AchievementObject.Name);
            AchievementManager.Instance.CurrentAchievementAmount++;
            AchievementManager.Instance.PlayAchievementSound();
            //Trigger this after your third time upgrading
            if (IncrementPanel.ClickerIncrement > 1000)
            {
                GameCenterManager.ReportAchievementUnlocked(GameCenterManager.GameCenterAchievement.Caster.Value());
            }
        }
    }

    public void TriggerBarRefresh()
    {
        //trigger bar change
        ProgressBar.value--;
        ProgressBar.value++;
    }
    
    public void ManageExclamationPoint()
    {
        ClickerExclamationPoint.SetActive(ProgressBar.value >= ProgressBar.maxValue);
    }
}
