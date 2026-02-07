using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class AdvertisementPanelScript : MonoBehaviour
{
    public TextMeshProUGUI RewardText;
    
    private long _rewardValue;
    
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        UpdateRewardCounter();
    }

    public void WatchAdAndCloseSplash()
    {
        SceneManager.Instance.InfluenceCrystalAdTriggeredThisLevel = true;
        AdvertisementManager.Instance.ShowStandardRewardAd(_rewardValue);
        SplashManager.Instance.CloseSplash();
    }
    
    private void UpdateRewardCounter()
    {
        _rewardValue = Monitor.Instance.GetInfluenceReceivedOverTime(900); // 15 minutes
        RewardText.text = Monitor.FormatNumberToString(_rewardValue) + " influence";
    }
}

