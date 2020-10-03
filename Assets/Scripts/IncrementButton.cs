﻿using System;
using System.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using Random = UnityEngine.Random;

public class IncrementButton : MonoBehaviour
{
    private ObjectPooler _objectPooler;
    private AudioManager _audioManager;
    private float _waitTime;
    public static int ClickerLevel = 0;
    public static long ClickCount = 0;
    public static int IncrementsThisSecond = 0;

    #region Singleton
    public static IncrementButton Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion
    
    public void Start()
    {
        _objectPooler = ObjectPooler.Instance;
        _audioManager = FindObjectOfType<AudioManager>();
    }

    void Update()
    {
        UpdatePassiveIncomeAndRefresh();
    }

    private void UpdatePassiveIncomeAndRefresh()
    {
        if (Time.time > _waitTime)
        {
            _waitTime = Time.time + 1.0f;
            Monitor.Instance.UpdatePassiveIncomeText();
            IncrementsThisSecond = 0;
        }
    }
    
    public void Increment()
    {
        var randomNumber = Random.Range(0.0f, 3.0f);
        var increment = 1;
        var helperHorse = ShopManager.Instance.Helpers.LastOrDefault(helper => helper.AmountOwned > 0)?.HorseBreed;
        
        if (randomNumber <= 0.03)
        {
            increment = GetIncrement(ClickerLevel, 9);
        } 
        else if (randomNumber <= 0.30)
        {
            increment = GetIncrement(ClickerLevel, 3);
        }
        else
        {
            increment = GetIncrement(ClickerLevel, 1);
        }
            
        _audioManager.Play("Cork", randomNumber);
        if (randomNumber <= 0.03)
        {
            var obj = _objectPooler.SpawnFromPool("IncrementBonusText");
            obj.GetComponentInChildren<TextMeshProUGUI>().text = "+" + Monitor.FormatNumberToString(increment);
        }
        else
        {
            var obj = _objectPooler.SpawnFromPool("IncrementText");
            obj.GetComponentInChildren<TextMeshProUGUI>().text = "+" + Monitor.FormatNumberToString(increment);
        }

        Monitor.Instance.IncrementInfluence(increment, helperHorse);
        ClickCount++;
        IncrementsThisSecond+=increment;
        var pointer = GameObject.Find("FingerPointerIncrementButton");
        if (pointer)
        {
            pointer.SetActive(false);
        }
        // Monitor.DestroyObject("FingerPointerIncrementButton");
    }

    public static int GetIncrement(int clickerLevel, int multIncrease)
    {
        return clickerLevel > 0 ? (int)Math.Pow(15*multIncrease, clickerLevel) : 1*multIncrease;
    }
}