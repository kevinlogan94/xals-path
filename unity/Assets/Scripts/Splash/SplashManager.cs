using System.Linq;
using UnityEngine;

public class SplashManager : MonoBehaviour
{
    public GameObject SplashPanel;
    public GameObject AchievementPanel;
    public GameObject AdvertisementPanel;
    public GameObject InfluenceOverTimePanel;
    public GameObject EndGamePanel;
    public GameObject BuffPanel;
    public GameObject LockAnimationObject;
    public GameObject CreaturePanel;
    public GameObject CreatureUIPanel;
    public GameObject SurveyPanel;
    public GameObject NewGamePanel;
    public GameObject PortalPanel;

    public Achievement[] Achievements;
    public Creature[] Creatures;
    public static SplashManager Instance;

    #region Singleton
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
        
    }

    public void TriggerSplash(string type, string objectName = null)
    {
        SplashPanel.SetActive(true);
        if (type == SplashType.Achievement.ToString())
        {
            AchievementPanel.SetActive(true);
            var achievementObject = Achievements.FirstOrDefault(x => x.Name == objectName);
            if (achievementObject == null)
            {
                Debug.LogWarning("We couldn't find the Achievement with the name: " + objectName);
                return;
            }
            AchievementPanelScript.Instance.Achievement = achievementObject; 
        }
        else if (type == SplashType.Creature.ToString())
        {
            CreaturePanel.SetActive(true);
            // I have an animation event at the end of this that turns on the horse panel
            var creature = Creatures.FirstOrDefault(x => x.Name == objectName);
            if (creature == null)
            {
                Debug.LogWarning("We couldn't find the creature with the name: " + objectName);
                return;
            }

            CreaturePanelScript.Instance.Creature = creature;
            LockAnimationObject.SetActive(true);
        }
        else if (type == SplashType.InfluenceOverTime.ToString())
        {
            InfluenceOverTimePanel.SetActive(true);
        }
        else if (type == SplashType.Buff.ToString())
        {
            BuffPanel.SetActive(true);
        }
        else if (type == SplashType.EndGame.ToString())
        {
            EndGamePanel.SetActive(true);
        }
        else if (type == SplashType.Survey.ToString())
        {
            SurveyPanel.SetActive(true);
        }
        else if (type == SplashType.NewGame.ToString())
        {
            NewGamePanel.SetActive(true);
        }
        else if (type == SplashType.Portal.ToString())
        {
            PortalPanel.SetActive(true);
        }
        else if (type == SplashType.Advertisement.ToString())
        {
            AdvertisementPanel.SetActive(true);
            if (Monitor.UseAnalytics)
            {
                AnalyticsManager.RecordEvent("AdOffer", new System.Collections.Generic.Dictionary<string, object>
                {
                    {"rewarded", true}
                });
            }
        }
    }

    public void CloseSplash()
    {
        SplashPanel.SetActive(false);
        CreaturePanel.SetActive(false);
        CreatureUIPanel.SetActive(false);
        AdvertisementPanel.SetActive(false);
        InfluenceOverTimePanel.SetActive(false);
        EndGamePanel.SetActive(false);
        BuffPanel.SetActive(false);
        SurveyPanel.SetActive(false);
        PortalPanel.SetActive(false);
        
        AchievementPanel.SetActive(false);
        FindObjectOfType<AudioManager>().Play("Pop");
        // AchievementUIPanel.SetActive(false);
    }
}

public enum SplashType
{
    Creature,
    Achievement,
    Advertisement,
    InfluenceOverTime,
    Buff,
    EndGame,
    Survey,
    NewGame,
    Portal
}
