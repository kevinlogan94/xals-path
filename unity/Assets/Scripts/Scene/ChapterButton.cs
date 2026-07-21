using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class ChapterButton : MonoBehaviour
{
    public TextMeshProUGUI ChapterNameText;
    public TextMeshProUGUI ChapterNumberText;
    public TextMeshProUGUI ClickerRewardText;
    public TextMeshProUGUI LevelRequirementText;
    public Image Avatar;
    private Sprite _disabledImage;
    private Sprite _activeImage;
    private Sprite _lockedImage;
    private Sprite _portalImage;
    
    #region Singleton
    public static ChapterButton Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion
    
    // Start is called before the first frame update
    void Start()
    {
        _disabledImage = Resources.Load<Sprite>("achiev_box_pressed");
        _activeImage = Resources.Load<Sprite>("achiev_box");
        _lockedImage = Resources.Load<Sprite>("lvl_lock_block");
        _portalImage = Resources.Load<Sprite>("Pixel/Achievements/portal");
    }

    // Update is called once per frame
    void Update()
    {
        UpdateButton();
    }

    public void TriggerChapter()
    {
        var nextChapter = SceneManager.Instance.NextChapter;
        if (Monitor.PlayerLevel >= nextChapter.LevelRequirement)
        {
            if (nextChapter.Number != 1)
            {
                ManaBar.Instance.ManaLevel++;
            }
            
            //prep the button for when it reappears -- Fix for button flicker between active and disabled button
            gameObject.GetComponent<Image>().sprite = _disabledImage;
            Avatar.sprite = _lockedImage;
            
            SceneManager.Instance.TriggerChapter(nextChapter.Number);
        }
    }

    private void UpdateButton()
    {
        var nextChapter = SceneManager.Instance.NextChapter;
        if (nextChapter == null)
        {
            Debug.LogWarning("We couldn't find the next chapter to show");
            return;
        }
        ChapterNumberText.text = "Chapter " + nextChapter.Number;
        ChapterNameText.text = nextChapter.Name;
        
        if (Monitor.PlayerLevel < nextChapter.LevelRequirement)
        {
            gameObject.GetComponent<Image>().sprite = _disabledImage;
            Avatar.sprite = _lockedImage;
            LevelRequirementText.text = "Lvl " + nextChapter.LevelRequirement;
        }
        else
        { 
            gameObject.GetComponent<Image>().sprite = _activeImage;
            Avatar.sprite = _portalImage;
            LevelRequirementText.text = "";
        }

        //Manage how the clicker reward text displays
        if (nextChapter.Number == 1 || nextChapter.Number >= 5)
        {
            ClickerRewardText.text = "";
        }
        else
        {
            ClickerRewardText.text = "2x Mana Increase";
        }
    }
}