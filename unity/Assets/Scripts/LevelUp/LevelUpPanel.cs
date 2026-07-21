using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class LevelUpPanel : MonoBehaviour
{
    public TextMeshProUGUI LevelUpRewardText;
    public bool RewardCounterUpdatedThisLevel;
    
    #region Singleton
    public static LevelUpPanel Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion
    
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if (!RewardCounterUpdatedThisLevel && !LevelUp.Instance.LevelUpInProgress)
        {
            UpdateRewardCounter();
        }
    }
    
    private void UpdateRewardCounter()
    {
        LevelUp.Instance.LevelUpReward = Monitor.Instance.GetInfluenceReceivedOverTime(300); // 5 minutes
        LevelUpRewardText.text = Monitor.FormatNumberToString(LevelUp.Instance.LevelUpReward) + " influence";
        RewardCounterUpdatedThisLevel = true;
    }
}
