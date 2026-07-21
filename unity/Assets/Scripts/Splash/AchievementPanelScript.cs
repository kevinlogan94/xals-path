using TMPro;
using UnityEngine;
using Image = UnityEngine.UI.Image;

public class AchievementPanelScript : MonoBehaviour
{
    public Achievement Achievement;
    public Image Image;
    public TextMeshProUGUI Description;
    public TextMeshProUGUI BeforeText;
    public TextMeshProUGUI AfterText;

    private string _currentText;
    
    #region Singleton
    public static AchievementPanelScript Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion
    
    // Start is called before the first frame update
    void Update()
    {
        Description.text = Achievement.RewardDescription;
        Image.sprite = Achievement.Artwork;
        
        //I technically only want this to trigger everytime we have a new achievement being displayed.
        if (_currentText != Description.text)
        {
            DefineBeforeAndAfterText();
            _currentText = Description.text;
        }
    }

    private void DefineBeforeAndAfterText()
    {
        const int tenHoursInSeconds = 36000;
        const int hourInSeconds = 3600;
        
        //by the time we hit this part, we have already received the bonus. Keep that in mind.
        switch (Achievement.Name)
        {
            case "Helper":
                BeforeText.text = Monitor.FormatNumberToString(Monitor.Instance.GetHelperPassiveIncome() / 2) + "/sec";
                AfterText.text = Monitor.FormatNumberToString(Monitor.Instance.GetHelperPassiveIncome()) + "/sec";
                break;
            case "Clicker":
                BeforeText.text = Monitor.FormatNumberToString(IncrementPanel.GetClickerIncrement(IncrementPanel.ClickerIncrement / ClickerLogic.ClickerIncrease, 1)) + "/click";
                AfterText.text = Monitor.FormatNumberToString(IncrementPanel.GetClickerIncrement(IncrementPanel.ClickerIncrement, 1)) + "/click";
                break;
            case "Xal":
                BeforeText.text = 100 * (ManaBar.Instance.ManaLevel - 1) + " Mana";
                AfterText.text = 100 * ManaBar.Instance.ManaLevel + " Mana";
                break;
            case "Video": case "Story":
                BeforeText.text = Monitor.FormatNumberToString(Monitor.Influence - Monitor.Instance.GetInfluenceReceivedOverTime(tenHoursInSeconds)) + " influence"; // 10 hours
                AfterText.text = Monitor.FormatNumberToString(Monitor.Influence) + " influence";
                break;
            default:
                BeforeText.text = Monitor.FormatNumberToString(Monitor.Influence - Monitor.Instance.GetInfluenceReceivedOverTime(hourInSeconds)) + " influence"; // 1 hour
                AfterText.text = Monitor.FormatNumberToString(Monitor.Influence) + " influence";
                break;
        }
    }

}
