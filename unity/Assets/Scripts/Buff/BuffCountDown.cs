using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class BuffCountDown : MonoBehaviour
{
    public TextMeshProUGUI CountDownText;

    // Update is called once per frame
    void Update()
    {
        UpdateDisplay();
        DisableCountDownPanel();
    }

    private void UpdateDisplay()
    {
        CountDownText.text = BuffManager.Instance.CountDownSecondsRemaining.ToString();
    }

    private void DisableCountDownPanel()
    {
        if (BuffManager.Instance.CountDownSecondsRemaining == 0)
        {
            gameObject.SetActive(false);
        }
    }
}
