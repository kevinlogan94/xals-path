using System;
using System.Linq;
using TMPro;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;
using Button = UnityEngine.UI.Button;

public class ShopHelper : MonoBehaviour
{
    public Helper Helper;

    public TextMeshProUGUI NameText;
    public TextMeshProUGUI CostText;
    public TextMeshProUGUI CountText;
    public TextMeshProUGUI PerSecondIncreaseText;
    public Image Avatar;
    private Sprite _disabledImage;
    private Sprite _activeImage;
    private Sprite _lockedImage;

    void Awake()
    {
        _disabledImage = Resources.Load<Sprite>("achiev_box_pressed");
        _activeImage = Resources.Load<Sprite>("achiev_box");
        _lockedImage = Resources.Load<Sprite>("lvl_lock_block");
    }
    
    // Start is called before the first frame update
    void Start()
    {
        NameText.text = Helper.Name;
        CostText.text = Monitor.FormatNumberToString(Helper.DynamicCost);
        PerSecondIncreaseText.text = Monitor.FormatNumberToString(Helper.DynamicIncrement) + "/sec";
    }

    void Update()
    {
        if (Helper.LevelRequirement > Monitor.PlayerLevel)
        {
            gameObject.GetComponent<Button>().image.sprite = _disabledImage;
            Avatar.sprite = _lockedImage;
            gameObject.GetComponent<Button>().interactable = false;
            CountText.text = "Lvl " + Helper.LevelRequirement;
            CountText.fontSize = 18;
            return;
        }

        Avatar.sprite = Helper.Artwork;
        gameObject.GetComponent<Button>().image.sprite = _activeImage;
        gameObject.GetComponent<Button>().interactable = true;
        CountText.fontSize = 36;

        if (Helper.DynamicIncrement > Helper.Increment)
        {
            PerSecondIncreaseText.text = Monitor.FormatNumberToString(Helper.DynamicIncrement) + "/sec";
        }

        CostText.text = Monitor.FormatNumberToString(Helper.DynamicCost);

        var newCount = "0";
        var resultHelper = ShopManager.Instance.Helpers.FirstOrDefault(x => x.Name == Helper.Name);
        if (resultHelper != null)
        {
            newCount = resultHelper.AmountOwned.ToString();
        }
        else
        {
            Debug.LogWarning("We couldn't find the helper: " + Helper.Name);
        }

        CountText.text = newCount;
    }
}