using TMPro;
using UnityEngine;
using Slider = UnityEngine.UI.Slider;

public class ProgressBar : MonoBehaviour
{
    public void UpdateText()
    {
        var slider = gameObject.GetComponent<Slider>();
        gameObject.GetComponentInChildren<TextMeshProUGUI>().text = slider.value + "/" + slider.maxValue;
    }
}
