using System;
using System.Collections.Generic;
using UnityEngine;
// Removed: using UnityEngine.Analytics - migrated to Unity Gaming Services
using UnityEngine.UI;

public class BottomNavManager : MonoBehaviour
{
    public GameObject ShopPanel;
    public GameObject AchievementPanel;
    public GameObject ScenePanel;
    public GameObject SettingsPanel;
    public GameObject CreditsPanel;
    public GameObject FingerPointerOutlook;
    public GameObject HidePanel;

    public Button SettingsButton;
    public Button AchievementButton;
    public Button SceneButton;
    public Button OutlookButton;
    public Button ShopButton;

    public string ActiveView;
    
    private Sprite _basicImage;
    private Sprite _activeImage;

    private AudioManager _audioManager;
    
    #region Singleton
    public static BottomNavManager Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion
    
    // Start is called before the first frame update
    void Start()
    {
        _audioManager = FindObjectOfType<AudioManager>();
        _basicImage = Resources.Load<Sprite>("Pixel/DefaultNavButton");
        _activeImage = Resources.Load<Sprite>("Pixel/ActiveNavButton");
        
        SelectView("outlook", true);
        SceneManager.Instance.CheckAndTriggerFirstChapter();
    }

    public void SelectViewInterface(string view)
    {
        SelectView(view);
    }

    public void SelectView(string view, bool muteSound = false)
    {
        // If we click the same button we used to open the panel, simply revert to the outlook.
        if (ActiveView == view)
        {
            view = Views.outlook.ToString();
        }
        
        TurnOffEverything();
        ActiveView = view;
        switch (view)
        {
            case "settings":
                SettingsPanel.SetActive(true);
                SettingsButton.image.sprite = _activeImage;
                if (Monitor.UseAnalytics)
                {
                    AnalyticsManager.RecordEvent("screen_visit", new Dictionary<string, object> { {"screen_name", Views.settings.ToString()} });
                };
                break;
            case "shop":
                ShopPanel.SetActive(true);
                ShopButton.image.sprite = _activeImage;
                if (Monitor.UseAnalytics)
                {
                    AnalyticsManager.RecordEvent("screen_visit", new Dictionary<string, object> { {"screen_name", Views.shop.ToString()} });
                }
                break;
            case "achievements":
                AchievementPanel.SetActive(true);
                AchievementButton.image.sprite = _activeImage;
                if (Monitor.UseAnalytics)
                {
                    AnalyticsManager.RecordEvent("screen_visit", new Dictionary<string, object> { {"screen_name", Views.achievements.ToString()} });
                };
                break;
            case "scene":
                ScenePanel.SetActive(true);
                SceneButton.image.sprite = _activeImage;
                if (Monitor.UseAnalytics)
                {
                    AnalyticsManager.RecordEvent("screen_visit", new Dictionary<string, object> { {"screen_name", Views.scene.ToString()} });
                };
                break;
            default:
                OutlookButton.image.sprite = _activeImage;
                if (Monitor.UseAnalytics)
                {
                    AnalyticsManager.RecordEvent("screen_visit", new Dictionary<string, object> { {"screen_name", Views.outlook.ToString()} });
                }
                break;
        }
        
        if (view == "outlook" && FingerPointerOutlook.activeSelf)
        {
            FingerPointerOutlook.SetActive(false);
        }

        if (muteSound) return;
        
        _audioManager.Play("Pop");

        if (view == Views.scene.ToString())
        {
            _audioManager.Play("Xals Theme");
        }
        else if (view == Views.outlook.ToString())
        {
            switch (CanvasBackgroundController.Instance.CurrentCanvasBackground.ToString())
            {
                case "River":
                    _audioManager.Play("River");
                    break;
                case "Meadow":
                    _audioManager.Play("Meadow");
                    break;
                case "Altar":
                    _audioManager.Play("Altar");
                    break;
            }
        }
        // Handheld.Vibrate();
    }

    private void TurnOffEverything()
    {
        //turn off panels
        ShopPanel.SetActive(false);
        AchievementPanel.SetActive(false);
        ScenePanel.SetActive(false);
        SettingsPanel.SetActive(false);
        CreditsPanel.SetActive(false);
        
        // reset bottom nav buttons
        SettingsButton.image.sprite = _basicImage;
        AchievementButton.image.sprite = _basicImage;
        SceneButton.image.sprite = _basicImage;
        OutlookButton.image.sprite = _basicImage;
        ShopButton.image.sprite = _basicImage;
    }

    public void ToggleActiveButtons(bool active)
    {
        OutlookButton.interactable = active;
        SceneButton.interactable = active;
        ShopButton.interactable = active;
        AchievementButton.interactable = active;
    }
}

public enum Views {
    settings,
    outlook,
    shop,
    achievements,
    scene,
}