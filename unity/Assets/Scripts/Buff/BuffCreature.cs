using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BuffCreature : MonoBehaviour
{
    private int _horizontalAnimationPlayed;
    public const int AnimationLimit = 4;
    public GameObject FingerPointer;

    // Start is called before the first frame update
    void Start()
    {
    }

    // Update is called once per frame
    void Update()
    {
        FingerPointer.SetActive(!BuffManager.Instance.BuffTutorialCompleted);
    }

    public void MonitorAnimation()
    {
        _horizontalAnimationPlayed++;
        if (_horizontalAnimationPlayed == AnimationLimit)
        {
            _horizontalAnimationPlayed = 0;
            gameObject.SetActive(false);
        }
    }

    public void TriggerBuffSplash()
    {
        SplashManager.Instance.TriggerSplash(SplashType.Buff.ToString());
        BuffManager.Instance.BuffTutorialCompleted = true;
        _horizontalAnimationPlayed = 0;
        gameObject.SetActive(false);
    }
}
