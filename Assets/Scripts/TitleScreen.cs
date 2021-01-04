﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TitleScreen : MonoBehaviour
{
    public GameObject TapToStart;
    public GameObject Version;
    public GameObject Title;

    public GameObject IntriguePanel;
    
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if (!IntriguePanel.activeSelf)
        {
            ShowTitle();
        }
    }

    public void CloseTitleScreen()
    {
        gameObject.SetActive(false);
        if(SceneManager.Instance.ScenePanel.activeSelf) return;
        switch (CanvasBackgroundController.Instance.CurrentCanvasBackground.ToString())
        {
            case "River":
                FindObjectOfType<AudioManager>().Play("River");
                break;
            case "Meadow":
                FindObjectOfType<AudioManager>().Play("Meadow");
                break;
            case "Altar":
                FindObjectOfType<AudioManager>().Play("Altar");
                break;
        }
    }

    public void ShowTitle()
    {
        Title.SetActive(true);
    }

    public void ShowDetails()
    {
        TapToStart.SetActive(true);
        Version.SetActive(true);
    }
}
