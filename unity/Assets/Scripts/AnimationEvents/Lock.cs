using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Lock : MonoBehaviour
{
    public GameObject CreatureUIPanel;
    
    public void DisableActiveState()
    {
        gameObject.SetActive(false);
    }

    public void ActivateNewHorsePanel()
    {
        CreatureUIPanel.SetActive(true);
    }
}
