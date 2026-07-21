using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SettingsManager : MonoBehaviour
{
    public GameObject AchievementButton;
    
    // Start is called before the first frame update
    void Start()
    {
        if (!Monitor.useAllCloudServices && Application.platform == RuntimePlatform.Android)
        {
            AchievementButton.SetActive(false);
        }
    }
}
