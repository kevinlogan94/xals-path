using System;
using System.Linq;
using UnityEngine;

public class AchievementManager : MonoBehaviour
{
    public GameObject AchievementPanel;
    public GameObject AchievementPointer;
    public GameObject AchievementExclamationPoint;
    
    //login
    public int LoginCount;
    public float LoginGoal;
    public DateTime LastLoginDate;
    
    //clicker
    public long CurrentClickedAmount;
    public float ClickerGoal;

    //helper
    public int CurrentHelperAmount;
    public float HelperGoal;

    //video
    public int CurrentVideoAmount;
    public float VideoGoal;
    
    //achievements
    public int CurrentAchievementAmount;
    public float AchievementGoal;
    
    public int CurrentStoryAmount;
    public float StoryGoal;

    //sharing and/or reviewing the app
    public const int ShareGoal = 1;
    public bool AppStoreReviewed = false;
    public bool FollowedOnTwitter = false;
    
    //tutorial
    public bool TutorialCompleted = false;
    
    private AudioManager _audioManager;

    #region Singleton
    public static AchievementManager Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion
    
    // Start is called before the first frame update
    void Start()
    {
        _audioManager = FindObjectOfType<AudioManager>();
        if (!SaveGame.SaveFileExists())
        {
            SetAchievementGoalDefaults();
            StoryGoal = 2; // keeping this separate because we need this across playthroughs.
        }
        else if (StoryGoal == 0) //TODO remove this after 0.2.6
        {
            StoryGoal = 2;
        }
    }

    // Update is called once per frame
    void Update()
    {
        ClickerProgress();
        HelperProgress();
        LoginProgress();
        ManageExclamationPoint();
        Tutorial();
    }

    public void SetAchievementGoalDefaults()
    {
        ClickerGoal = 150;
        HelperGoal = 30;
        VideoGoal = 5;
        AchievementGoal = 10;
        LoginCount = 1;
        LoginGoal = 2;
        LastLoginDate = DateTime.UtcNow;
    }

    public void Tutorial()
    {
        if ((CurrentClickedAmount >= ClickerGoal 
             || CurrentHelperAmount >= HelperGoal) 
            && !AchievementPanel.activeSelf
            && !TutorialCompleted)
        {
            AchievementPointer.SetActive(true);
        }
        else
        {
            AchievementPointer.SetActive(false);
        }
    }

    public void PlayAchievementSound()
    {
        _audioManager.Play("LevelUp");
    }

    private void ManageExclamationPoint()
    {
        var showExclamationPoint = AchievementReady();
        AchievementExclamationPoint.SetActive(SceneManager.Instance.ActiveChapter == 0 && showExclamationPoint);
    }

    private bool AchievementReady()
    {
        var ready = false;
        if (ClickerGoal <= CurrentClickedAmount)
        {
            ready = true;
        } else if (HelperGoal <= CurrentHelperAmount)
        {
            ready = true;
        } else if (LoginGoal <= LoginCount)
        {
            ready = true;
        } else if (VideoGoal <= CurrentVideoAmount)
        {
            ready = true;
        }
        return ready;
    }

    private void ClickerProgress()
    {
        CurrentClickedAmount = IncrementPanel.ClickCount;
    }

    private void HelperProgress()
    {
        CurrentHelperAmount = ShopManager.Instance.Helpers.Sum(x => x.AmountOwned);
    }

    private void LoginProgress()
    {
        //Use .Date since we only want to compare the date and not the time
        if ((DateTime.UtcNow.Date - LastLoginDate.Date).TotalDays >= 1)
        {
            LastLoginDate = DateTime.UtcNow;
            LoginCount++;
        }
    }
}