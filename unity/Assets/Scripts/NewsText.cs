using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NewsText : MonoBehaviour
{
    private float _waitTime = 15.0f;
    private float _currentWaitTime = 15.0f;
    private bool _justTurnedOn = true;
    
    public void Start()
    {
        _currentWaitTime = Time.time + _waitTime;
    }

    public void Update()
    {
        WaitThenDisableObject();
    }

    public void WaitThenDisableObject()
    {
        if (_justTurnedOn)
        {    
            _currentWaitTime = Time.time + _waitTime;
            _justTurnedOn = false;
        }
        if (Time.time > _currentWaitTime)
        {
            _justTurnedOn = true;
            gameObject.SetActive(false);
        }
    }
}
