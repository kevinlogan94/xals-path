﻿using System.Collections.Generic;
using System.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.Analytics;
using UnityEngine.UI;

public class SceneManager : MonoBehaviour
{
    public Chapter[] Chapters;
    public GameObject TextBox;
    public Chapter NextChapter;

    public string[] Banter;
    private int _banterIndex = 0;
    private readonly float _banterWaitTime = 5f;
    private float _currentBanterWaitTime = 5f;
    private bool _banterActive = false;
    
    private readonly float _pointerWaitTime = 10f;
    private float _currentPointerWaitTime = 10f;
    private bool _waitingOnPlayer; 

    public string[] Tutorial;
    public GameObject ScenePanel;
    public GameObject FingerPointerXal;
    public GameObject ExclamationPointXal;
    public GameObject StartChapterOneFingerPointer;
    public Button OutlookButton;
    public GameObject InfluenceCrystal;
    public GameObject ChapterButtonGameObject;

    private int _chapterIndex;
    public int ActiveChapter;

    public bool TutorialActive;
    private int _tutorialIndex;

    #region Singleton
    public static SceneManager Instance;

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
        DisableBanterAfterNoInteraction();
        ManageButtons();
        ManageStartChapterOneFingerPointer();
        //progress in the tutorial after player purchases from the shop.
        if (_tutorialIndex == 2 && ShopManager.Instance.Helpers[0].AmountOwned >= 1 && ScenePanel.activeSelf)
        {
            TriggerTutorial();
            FingerPointerXal.SetActive(false);
        }
        // Have him reset to reading his book if nothing is going on in the scene.
        if (!_banterActive && !TutorialActive && ActiveChapter == 0)
        {
            SceneBackgroundController.Instance.UpdateSceneBackground(Expression.GenericDown);
        }
        //Keep the next chapter up to date
        NextChapter = Chapters.FirstOrDefault(chapter => !chapter.SceneViewed);
        ManageExclamationPoint();
    }
    
    public void TriggerChapter(int chapterNumber)
    {
        var chapter = Chapters.FirstOrDefault(x => x.Number == chapterNumber);
        if (chapter == null)
        {
            Debug.LogWarning("We couldn't find Chapter " + chapterNumber);
            return;   
        }
        if (ActiveChapter == 0 && Monitor.UseAnalytics)
        {
            Analytics.CustomEvent("ChapterTriggered", new Dictionary<string, object>
            {
                {"Chapter", chapterNumber}
            });
        }

        ActiveChapter = chapterNumber;
        _banterActive = false;
        TextBox.SetActive(true);
        ExclamationPointXal.SetActive(false);
        var textMeshPro = TextBox.GetComponentInChildren<TextMeshProUGUI>();

        textMeshPro.text = chapter.Quotes[_chapterIndex];
        SceneBackgroundController.Instance.UpdateSceneBackground(chapter.Expressions[_chapterIndex]);
        
        if (_chapterIndex < chapter.Quotes.Length - 1)
        {
            _chapterIndex++;   
        }
        else
        {
            _chapterIndex = 0;
            chapter.SceneViewed = true;
            ActiveChapter = 0;
            TextBox.SetActive(false);
            
            if (chapterNumber == 1)
            {
                TriggerTutorial();
            }
            else
            {
                var xalAchievement = SplashManager.Instance.Achievements.FirstOrDefault(x => x.Name == "Xal");
                if (xalAchievement != null)
                {
                    SplashManager.Instance.TriggerSplash(SplashType.Achievement.ToString(), xalAchievement.Name);   
                }
                else
                {
                    Debug.LogWarning("We couldn't find the Xal achievement to display in the splash panel.");
                }
            }
        }
    }
    
    #region UI Interaction methods

    private void ManageButtons()
    {
        if ((ActiveChapter != 0 || TutorialActive) && Chapters.Any(x=>x.SceneViewed == false))
        {
            ChapterButtonGameObject.SetActive(false);
            InfluenceCrystal.SetActive(false);
        }
        else
        {
            ChapterButtonGameObject.SetActive(true);
            InfluenceCrystal.SetActive(true);
        }
    }

    private void ManageExclamationPoint()
    {
        if (NextChapter != null)
        {
            if (Monitor.PlayerLevel >= NextChapter.LevelRequirement && ActiveChapter == 0 && Monitor.PlayerLevel != 1)
            {
                ExclamationPointXal.SetActive(true);
            }
        }
        else
        {
            Debug.LogWarning("We couldn't find the next chapter in the story.");
        }
    }

    public void TriggerChat()
    {
        var chapter1 = Chapters.FirstOrDefault(chapter => chapter.Number == 1);
        if (chapter1 != null && !chapter1.SceneViewed)
        {
            TriggerChapter(1);
            if (Monitor.UseAnalytics)
            {
                AnalyticsEvent.FirstInteraction();
            }
        } 
        else if (TutorialActive)
        {
            TriggerTutorial();
            // AnalyticsEvent.TutorialStart();
        }
        else if (ActiveChapter == 0)
        {
            TriggerBanter();
        }
        else
        {
            TriggerChapter(ActiveChapter);
        }
    }

    public void ClickInfluenceCrystal()
    {
        if (Chapters.Any(x=>x.SceneViewed))
        {
            SplashManager.Instance.TriggerSplash(SplashType.Advertisement.ToString());
        }
        else
        {
            TriggerChat();
        }
    }
    
    #endregion

    #region Tutorial methods
    private void TriggerTutorial()
    {
        TutorialActive = true;
        SceneBackgroundController.Instance.UpdateSceneBackground(Expression.Generic);
        if (_tutorialIndex < Tutorial.Length)
        {
            var textMeshPro = TextBox.GetComponentInChildren<TextMeshProUGUI>();
            switch (_tutorialIndex)
            {
                // Set up user to to go to shop
                case 1 when ShopManager.Instance.Helpers[0].AmountOwned == 0:
                {
                    TextBox.SetActive(true);
                    textMeshPro.text = Tutorial[_tutorialIndex];
                    _tutorialIndex++;
                
                    // Trigger the shop tutorial
                    BottomNavManager.Instance.HidePanel.SetActive(false);
                    Monitor.Influence = ShopManager.Instance.Helpers[0].DynamicCost;
                    break;
                }
                case 2 when ShopManager.Instance.Helpers[0].AmountOwned == 0:
                {
                    break;
                }
                default:
                    TextBox.SetActive(true);
                    textMeshPro.text = Tutorial[_tutorialIndex];
                    _tutorialIndex++;
                    break;
            }
        }
        else
        {
            OutlookButton.interactable = true;
            Monitor.Instance.TriggerOutlookTutorial();
            _tutorialIndex = 0;
            TutorialActive = false;
            TextBox.SetActive(false);
        }
    }

    public void CheckAndTriggerFirstChapter()
    {
        var chapter1 = Chapters.FirstOrDefault(chapter => chapter.Number == 1);
        if (chapter1 == null)
        {
            Debug.LogWarning("We could find chapter 1.");
            return;
        }
        if (!chapter1.SceneViewed)
        {
            BottomNavManager.Instance.HidePanel.SetActive(true);
            BottomNavManager.Instance.SelectView("scene");
            // TriggerChapter(1);
            OutlookButton.interactable = false;
        }
    }

    private void ManageStartChapterOneFingerPointer()
    {
        //no chapters have been viewed and we aren't in the middle of a chapter.
        if (!Chapters.Any(x=>x.SceneViewed) && ActiveChapter == 0)
        {
            //Start the waiting session
            if (!StartChapterOneFingerPointer.activeSelf && !_waitingOnPlayer)
            {
                _currentPointerWaitTime = Time.time + _pointerWaitTime;
                _waitingOnPlayer = true;
            }
            //If we have waited longer than the defined time, prompt the pointer.
            if (Time.time > _currentPointerWaitTime)
            {
              StartChapterOneFingerPointer.SetActive(true);
            }
        } 
        else
        {
            StartChapterOneFingerPointer.SetActive(false);
            _waitingOnPlayer = false;
        }
    }
    #endregion
    
    #region Banter Methods
    private void TriggerBanter()
    {
        _currentBanterWaitTime = Time.time + _banterWaitTime;
        _banterActive = true;
        TextBox.SetActive(true);
        var textMeshPro = TextBox.GetComponentInChildren<TextMeshProUGUI>();
        textMeshPro.text = Banter[_banterIndex];
        SceneBackgroundController.Instance.UpdateSceneBackground(Expression.Angry);

        if (_banterIndex < Banter.Length - 1)
        {
            _banterIndex++;   
        }
        else
        {
            _banterIndex = 0;
        }
    }

    private void DisableBanterAfterNoInteraction()
    {
        if (_banterActive && TextBox.activeSelf && Time.time > _currentBanterWaitTime)
        {
            _banterActive = false;
            TextBox.SetActive(false);
        }
    }
    #endregion
}
