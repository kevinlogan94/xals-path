using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using UnityEngine;
// Removed: using UnityEngine.Analytics - migrated to Unity Gaming Services
using Random = UnityEngine.Random;

//Note: The Magic and CreatureRegion gameobjects share this.
public class CreatureRegion : MonoBehaviour
{
    public GameObject MagicObject;
    public GameObject CreatureObject;
    private ObjectPooler _objectPooler;
    private AudioManager _audioManager;

    public void Start()
    {
        
        _objectPooler = ObjectPooler.Instance;
        _audioManager = FindObjectOfType<AudioManager>();
    }
    
    public void ResetAndDisableActiveState()
    {
        CreatureObject.SetActive(true);
        MagicObject.SetActive(false);
        gameObject.SetActive(false);
    }

    public void DisableCreatureObject()
    {
        CreatureObject.SetActive(false);
    }

    public void EnableMagicIdleAnimation()
    {
        var magicAnimator = MagicObject.GetComponent<Animator>();
        if (magicAnimator == null)
        {
            Debug.LogWarning("We couldn't find the animator for the magic gameobject.");
            return;
        }
        magicAnimator.Play(MagicAnimations.MagicIdle.ToString());
    }

    public void TriggerMagicOnCreature()
    {
        if (ManaBar.Instance.HasEnoughMana())
        {
            PerformIncrement();
            MagicObject.SetActive(true);
            _audioManager.Play("MagicSpell");
        }
        if (BuffManager.Instance.BuffActive)
        {
            BuffManager.Instance.CountDownStarted = true;
        }
    }

    private void PerformIncrement()
    {
        long increment;
        var randomNumber = Random.Range(0.0f, 1.0f);
        if (MagicObject.activeSelf)
        {
            increment = IncrementPanel.GetClickerIncrement(IncrementPanel.ClickerIncrement, 1);
            TriggerIncrementText(increment, IncrementTexts.IncrementText);
        }
        else if (randomNumber <= 0.15)
        {
            increment = IncrementPanel.GetClickerIncrement(IncrementPanel.ClickerIncrement, 10);
            TriggerIncrementText(increment, IncrementTexts.IncrementBonusText);
        }
        else
        {
            increment = IncrementPanel.GetClickerIncrement(IncrementPanel.ClickerIncrement, 5);
            TriggerIncrementText(increment, IncrementTexts.IncrementBonusText);
        }

        ManaBar.Instance.DeductMana();
        Monitor.Instance.IncrementInfluence(increment);
        IncrementPanel.IncrementsThisSecond+=increment;
        IncrementPanel.ClickCount++;
        
        if (!BuffManager.Instance.BuffActive)
        {
            BuffManager.Instance.ClickCountSinceLastBuff++;   
        }
        else
        {
            BuffManager.Instance.ClickCountForThisBuffSession++;
        }
        
        var pointer = GameObject.Find("FingerPointerIncrementPanel");
        if (pointer)
        {
            pointer.SetActive(false);
        }

        if (IncrementPanel.ClickCount%10 == 0 && Monitor.UseAnalytics)
        {
            AnalyticsManager.RecordEvent("ClickIncrementButton", new Dictionary<string, object>
            {
                {"ClickCount", IncrementPanel.ClickCount}
            });
        }
    }

    private void TriggerIncrementText(long increment, IncrementTexts incrementText)
    {
        var obj = _objectPooler.SpawnFromPool(incrementText.ToString(), Input.mousePosition);
        GameObject child;
        if (incrementText == IncrementTexts.IncrementBonusText)
        {
            child = obj.transform.Find(IncrementTexts.IncrementBonusTextChild.ToString())?.gameObject;
        }
        else
        {
            child = obj.transform.Find(IncrementTexts.IncrementTextChild.ToString())?.gameObject;
        }
        if (child != null)
            child.GetComponentInChildren<TextMeshProUGUI>().text = "+" + Monitor.FormatNumberToString(increment);
    }
}

public enum MagicAnimations
{
    MagicEffect,
    MagicIdle
}


public enum IncrementTexts
{
    IncrementBonusText,
    IncrementBonusTextChild,
    IncrementText,
    IncrementTextChild
}