using TMPro;
using UnityEngine;

public class Score : MonoBehaviour
{
    public TextMeshProUGUI ScoreText;

    // Update is called once per frame
    void Update()
    {
        ScoreText.text = Monitor.FormatNumberToString(Monitor.Influence);
    }
}
