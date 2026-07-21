using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class barlog : MonoBehaviour
{
    public GameObject BarlogMessageBox;
    public GameObject BarlogPanel;
    
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    void DestroyOnFadout()
    {
        BarlogMessageBox.SetActive(false);
        BarlogPanel.SetActive(false);
        gameObject.SetActive(false);
    }

    void DisplayTextBox()
    {
        BarlogMessageBox.SetActive(true);
        SceneManager.Instance.TriggerBarlogText();
    }
    
    public enum BarlogAnimations
    {
        Fadein,
        Fadeout
    }
}
