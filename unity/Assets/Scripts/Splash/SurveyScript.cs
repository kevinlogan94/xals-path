using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SurveyScript : MonoBehaviour
{
    private const string SurveyMonkeyUrl = "https://www.surveymonkey.com/r/F9SWS9P";

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
    
    public void CloseSplash()
    {
        SplashManager.Instance.CloseSplash();
    }

    public void TakeSurveyAndCloseSplash()
    {
        Application.OpenURL(SurveyMonkeyUrl);
        SplashManager.Instance.CloseSplash();
    }
}
