using System;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using UnityEngine;
// Removed: using UnityEngine.Analytics - migrated to Unity Gaming Services
using UnityEngine.UI;
using Random = UnityEngine.Random;

public class IncrementPanel : MonoBehaviour
{
    private ObjectPooler _objectPooler;
    private AudioManager _audioManager;
    private float _waitTime;
    public static long ClickerIncrement = 1;
    public static long ClickCount = 0;
    public static long IncrementsThisSecond = 0;

    #region Singleton
    public static IncrementPanel Instance;

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
    
    private void PerformIncrement()
    {
        var creaturesThatCanSpawn = ShopManager.Instance.Helpers
            .Where(helper => Monitor.CreatureCanSpawn(helper.Creature) && helper.AmountOwned > 0)
            .Select(helper => helper.Creature).ToList();
        var randomIndex = Random.Range(0, creaturesThatCanSpawn.Count);
        var creatureToSpawn = creaturesThatCanSpawn.ElementAt(randomIndex);
        var increment = GetClickerIncrement(ClickerIncrement, 1);
            
        var obj = _objectPooler.SpawnFromPool("IncrementText", Input.mousePosition);
        var child = obj.transform.Find("IncrementTextChild")?.gameObject;
        if (child != null)
        {
            child.GetComponentInChildren<TextMeshProUGUI>().text = "+" + Monitor.FormatNumberToString(increment);
        }

        if (creatureToSpawn != null)
        {
            Monitor.Instance.IncrementInfluence(increment, creatureToSpawn);
        }
        ClickCount++;
        if (!BuffManager.Instance.BuffActive)
        {
            BuffManager.Instance.ClickCountSinceLastBuff++;   
        }
        else
        {
            BuffManager.Instance.ClickCountForThisBuffSession++;
        }
        IncrementsThisSecond+=increment;
        var pointer = GameObject.Find("FingerPointerIncrementPanel");
        if (pointer)
        {
            pointer.SetActive(false);
        }

        if (ClickCount%10 == 0 && Monitor.UseAnalytics)
        {
            AnalyticsManager.RecordEvent("ClickIncrementButton", new Dictionary<string, object>
            {
                {"ClickCount", ClickCount}
            });
        }
        
        ManaBar.Instance.DeductMana();
        SpawnIncrementCastAnimation();
        // Handheld.Vibrate();
        // Monitor.DestroyObject("FingerPointerIncrementPanel");
    }

    public void Increment()
    {
        if (ManaBar.Instance.HasEnoughMana())
        {
            PerformIncrement();
            _audioManager.Play("MagicSpell");
        }
        if (BuffManager.Instance.BuffActive)
        {
            BuffManager.Instance.CountDownStarted = true;
        }
    }

    private void SpawnIncrementCastAnimation()
    {
        if (Application.platform == RuntimePlatform.Android || Application.platform == RuntimePlatform.IPhonePlayer)
        {
            _objectPooler.SpawnFromPool("Cast", Input.GetTouch(0).position);
        }
        else
        {
            _objectPooler.SpawnFromPool("Cast", Input.mousePosition);   
        }
    }

    public static long GetClickerIncrement(long clickerIncrement, int multIncrease)
    {
        return clickerIncrement * multIncrease;
    }
}