using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Random = UnityEngine.Random;

public class ShopManager : MonoBehaviour
{
    public Helper[] Helpers;

    public GameObject ShopPanel;
    public GameObject FingerPointerShop;
    public GameObject FingerPointerNatureButton;
    public GameObject ShopExclamationPoint;
    public GameObject FingerPointerXal;

    private float _waitTime = 1.0f;
    private float _currentWaitTime = 1.0f;

    private AudioManager _audioManager;
    
    #region Singleton
    public static ShopManager Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion

    void Start()
    {
        _audioManager = FindObjectOfType<AudioManager>();
    }

    void Update()
    {
        ManageExclamationPoint();
        HelperAction();
        
        //shop tutorial
        if (Monitor.PlayerLevel == 1)
        {
            var nature = Helpers.FirstOrDefault(x => x.Name == "Nature");
            if (Monitor.Influence >= nature?.Cost && nature?.AmountOwned == 0)
            {
                FingerPointerShop.SetActive(!ShopPanel.activeSelf);
                // ShopTutorialPanel.SetActive(true);
                FingerPointerNatureButton.SetActive(ShopPanel.activeSelf);
            }
        }
    }
    
    public void AddHelper(string helperName)
    {
        foreach (var helper in Helpers)
        {
            if (helper.Name == helperName && helper.DynamicCost <= Monitor.Influence)
            {
                Monitor.Influence -= helper.DynamicCost;
                helper.DynamicCost = (long) Math.Round(helper.DynamicCost * 1.3, 0);
                // Monitor.Instance.UpdatePassiveIncomeText();
                _audioManager.Play("CoinToss");
                if (helper.AmountOwned == 0)
                {
                    SplashManager.Instance.TriggerSplash(SplashType.Creature.ToString(), helper.Creature.Name);
                }
                helper.AmountOwned++;
                if (Monitor.UseAnalytics)
                {
                    AnalyticsManager.RecordEvent("HelperCount", new Dictionary<string, object>
                    {
                        {"Count", Helpers.Sum(x => x.AmountOwned)}
                    });
                }
            }

            if (helper.Name == "Nature" && helper.AmountOwned == 1)
            {
                FingerPointerShop.SetActive(false);
                FingerPointerNatureButton.SetActive(false);
                // ShopTutorialPanel.SetActive(false);
                if (SceneManager.Instance.TutorialActive)
                {
                    FingerPointerXal.SetActive(true);
                }
            }
        }

        var allCreaturesOwned = Helpers.All(x => x.AmountOwned > 0);
        if (allCreaturesOwned)
        {
            GameCenterManager.ReportAchievementUnlocked(GameCenterManager.GameCenterAchievement.Master.Value());
        }
        // Handheld.Vibrate();
    }

    public void ManageExclamationPoint()
    {
        var showExclamationPoint = false;
        foreach (var helper in Helpers)
        {
            if (helper.LevelRequirement <= Monitor.PlayerLevel 
                && helper.DynamicCost <= Monitor.Influence
                && SceneManager.Instance.ActiveChapter == 0)
            {
                showExclamationPoint = true;
                ShopExclamationPoint.SetActive(true);
            }
        }

        if (!showExclamationPoint)
        {
            ShopExclamationPoint.SetActive(false);
        }
    }
    
    private void HelperAction()
    {
        if (Time.time > _currentWaitTime && !SceneManager.Instance.TutorialActive && !Monitor.Instance.FingerPointerIncrementButton.activeSelf)
        {
            _currentWaitTime = Time.time + _waitTime;
            for (var index = 0; index < Helpers.Length; index++)
            {
                var helper = Helpers[index];    
                if (helper.AmountOwned > 0)
                {
                    var increment = helper.DynamicIncrement > helper.Increment
                        ? helper.DynamicIncrement
                        : helper.Increment;
                    var waitToSpawn = 1 + Random.Range(0.0f, 2.0f); //Set a random lag for the next creature to spawn.
                    Monitor.Instance.IncrementInfluence(increment * helper.AmountOwned, helper.Creature, waitToSpawn);
                }
            }
        }
    }
}