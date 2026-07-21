using UnityEngine;

public class BuffManager : MonoBehaviour
{
    public GameObject BuffCountDown;
    public GameObject BuffCreature;
    public int CountDownSecondsRemaining;
    private float _currentWaitBeforeDecrement;
    public int ClickCountSinceLastBuff;
    public int ClickCountForThisBuffSession;

    public bool CountDownStarted;
    public bool BuffActive;

    public bool BuffTutorialCompleted;
    public bool BuffedThisLevel;
    
    private AudioManager _audioManager;

    #region Singleton
    public static BuffManager Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion
    
    // Start is called before the first frame update
    void Start()
    {
        _audioManager = FindObjectOfType<AudioManager>();
    }

    // Update is called once per frame
    void Update()
    {
        if (BuffActive)
        {
            RemoveBuffs();
            DecrementCountDown();
            CheckAndTriggerTapperGameCenterAchievement();
        }
        CheckAndSpawnBuffCreature();
    }
    
    public void TriggerBuff(BuffType buffType, int seconds)
    {
        // we only have 1 buff currently so...
        CountDownSecondsRemaining = seconds;
        ManaBar.Instance.InfiniteManaBuffActive = true;
        BuffActive = true;
        _audioManager.Play("Choir");
        
        BuffCountDown.SetActive(true);
        _currentWaitBeforeDecrement = Time.time + 1f; // wait time of 1 second
    }

    public void SpawnBuffCreature()
    {
        BuffCreature.SetActive(true);
    }

    private void CheckAndSpawnBuffCreature()
    {
        if (ClickCountSinceLastBuff < 200 || BuffActive) return;
        BuffCreature.SetActive(true);
        ClickCountSinceLastBuff = 0;
        ClickCountForThisBuffSession = 0;
    }

    private void DecrementCountDown()
    {
        if (Time.time > _currentWaitBeforeDecrement && CountDownStarted)
        {
            CountDownSecondsRemaining--;
            _currentWaitBeforeDecrement = Time.time + 1f;
        }
    }

    private void RemoveBuffs()
    {
        if (CountDownSecondsRemaining <= 0)
        {
            ManaBar.Instance.InfiniteManaBuffActive = false;
            BuffActive = false;
            CountDownStarted = false;
            _audioManager.Play("DeBuff");
        }
    }

    private void CheckAndTriggerTapperGameCenterAchievement()
    {
        if (ClickCountForThisBuffSession >= 100)
            GameCenterManager.ReportAchievementUnlocked(GameCenterManager.GameCenterAchievement.Tapper.Value());
    }
}

public enum BuffType
{
    Mana
}