using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using TMPro;
using UnityEngine;
// Removed: using UnityEngine.Analytics - migrated to Unity Gaming Services
using UnityEngine.UI;
using Random = Unity.Mathematics.Random;

public class LevelUp : MonoBehaviour
{
    public Slider Slider;
    public GameObject LevelUpPanelGameObject;
    public GameObject FingerPointerLevel;
    public GameObject LevelExclamationPoint;
    public GameObject LevelUpTutorialPanel;
    public GameObject BottomNavHidePanel;
    public long LevelUpReward = 20;
    public long InfluenceEarnedEveryLevelSoFar = 0; //Deprecated
    private bool _jinglePlayedThisLevel = false;
    private AudioManager _audioManager;
    private const int MaxLevel = 50;

    public bool LevelUpInProgress;

    #region Singleton
    public static LevelUp Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion
    
    void Start()
    {
        _audioManager = FindObjectOfType<AudioManager>();
    }
    
    // Update is called once per frame
    void Update()
    {
        GameObject.Find("LevelUpText").GetComponent<TextMeshProUGUI>().text = "Lvl " + Monitor.PlayerLevel;
        UpdateSliderProgress();
        ReadyToLevelUp();
    }

    public void LevelUpPlayer(bool watchAd = false)
    {
        if (ReadyToLevelUp() && !LevelUpInProgress)
        {
            LevelUpInProgress = true;
            
            //level up reward 
            if (!watchAd)
            {
                // Skip ad - give 1x reward (original baseline)
                Monitor.Instance.IncrementInfluence(LevelUpReward);
                StartCoroutine(WaitForAdAndTriggerLevelUp());
            }
            else 
            {
                // Watch ad - give 3x reward on completion
                var bonusReward = LevelUpReward * 3;
                AdvertisementManager.Instance.ShowStandardRewardAd(bonusReward);
            }
        }
    }
    
    IEnumerator WaitForAdAndTriggerLevelUp()
    {
        yield return null;
        
        //Update Level up progress bar
        const float levelMultiplier = 3.25f;
        if ((Slider.maxValue * levelMultiplier) < float.MaxValue)
        {
            Slider.maxValue = (int) Math.Round(Slider.maxValue * levelMultiplier);   
        }
        else
        {
            Slider.maxValue = float.MaxValue;
        }
        Slider.value = 0; 
        // InfluenceEarnedEveryLevelSoFar = Monitor.TotalInfluenceEarned; DEPRECATED

        if (Monitor.UseAnalytics)
        {
            AnalyticsManager.RecordEvent("TotalInfluenceEarnedThisLevel", new Dictionary<string, object>
            {
                {"Influence", Monitor.TotalInfluenceEarned}
            });
        }
        //Let's reset this each level otherwise this number will get massive.
        Monitor.TotalInfluenceEarned = 0;
            
        // Level Up Character
        Monitor.PlayerLevel++;
        if (Monitor.UseAnalytics)
        {
            AnalyticsManager.LevelStart(Monitor.PlayerLevel);
        }

        BuffManager.Instance.BuffedThisLevel = false;
        SceneManager.Instance.InfluenceCrystalAdTriggeredThisLevel = false;
            
        //close tutorial
        if (Monitor.PlayerLevel==2)
        {
            Monitor.DestroyObject("FingerPointerLevel");
            LevelUpTutorialPanel.SetActive(false);
            BottomNavHidePanel.SetActive(false);
        }
        
        //reset fields
        _jinglePlayedThisLevel = false;
        LevelUpPanel.Instance.RewardCounterUpdatedThisLevel = false;
        
        _audioManager.Play("Pop");
            
        // Close Panel
        LevelUpPanelGameObject.SetActive(false);
        LevelUpInProgress = false;
    }

    private bool ReadyToLevelUp()
    {
        if (Slider.value >= Slider.maxValue)
        {
            if (LevelUpPanelGameObject.activeSelf) return true;
            
            //If we aren't in the middle of a scene
            if (SceneManager.Instance.ActiveChapter == 0 && !LevelExclamationPoint.activeSelf)
            {
                LevelExclamationPoint.SetActive(true);
            }
            if (!gameObject.GetComponent<Button>().interactable)
            {
                gameObject.GetComponent<Button>().interactable = true;
            }
            if (Monitor.PlayerLevel == 1 && BottomNavManager.Instance.ActiveView == Views.outlook.ToString())
            {
                BottomNavHidePanel.SetActive(true);
                LevelUpTutorialPanel.SetActive(true);
                FingerPointerLevel.SetActive(true);
            }
            else if (!_jinglePlayedThisLevel)
            {
                _audioManager.Play("LevelUp2");
                _jinglePlayedThisLevel = true;
            }
            return true;
        }
        gameObject.GetComponent<Button>().interactable = false;
        LevelExclamationPoint.SetActive(false);
        return false;
    }

    #region UI Methods
    
    public void OpenLevelUpPanel()
    {
        if (Slider.value >= Slider.maxValue)
        {
            _audioManager.Play("LevelUp2");
            LevelUpPanelGameObject.SetActive(true);
            if (Monitor.UseAnalytics)
            {
                AnalyticsManager.RecordEvent("AdOffer", new Dictionary<string, object>
                {
                    {"rewarded", true}
                });
            }
        }
    }

    private void UpdateSliderProgress()
    {
        if (Monitor.PlayerLevel >= MaxLevel || Slider.maxValue >= float.MaxValue)
        {
            Slider.value = Slider.minValue;
        }
        else if (Monitor.TotalInfluenceEarned < Slider.maxValue)
        {
            Slider.value = Monitor.TotalInfluenceEarned;
        }
        else
        {
            Slider.value = Slider.maxValue;
        }
    }
    
    #endregion
}