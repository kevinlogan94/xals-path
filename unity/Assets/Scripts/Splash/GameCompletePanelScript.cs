using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameCompletePanelScript : MonoBehaviour
{
    public GameObject CreditsPanel;
    
    public void TransitionToCredits()
    {
        CreditsPanel.SetActive(true);
        SceneManager.Instance.ScenePanel.SetActive(false);
        SplashManager.Instance.CloseSplash();
    }
}
