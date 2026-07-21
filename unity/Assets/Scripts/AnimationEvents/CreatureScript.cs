using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CreatureScript : MonoBehaviour
{
    public string CreatureName;
    
    public void DisableActiveState()
    {
        gameObject.SetActive(false);
    }
}
