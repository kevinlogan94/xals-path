using TMPro;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// VideoLogic - DEPRECATED
/// This achievement was for watching ads, which have been removed from the game.
/// This file is kept for reference but should not be used.
/// Consider removing the associated UI elements from your scenes.
/// </summary>
public class VideoLogic : MonoBehaviour, IAchievement
{
    public Achievement AchievementObject; 
    public TextMeshProUGUI Title;
    public TextMeshProUGUI RewardDescription;
    public Slider ProgressBar;
    public Image Image;
    public GameObject VideoExclamationPoint;

    private long _rewardValue;
    
    void Start()
    {
        // Ads removed - this achievement is no longer functional
        // Hide the UI element if it's still in the scene
        if (gameObject != null)
        {
            gameObject.SetActive(false);
        }
        Debug.LogWarning("VideoLogic achievement is deprecated - ads have been removed from the game");
    }

    void Update()
    {
        // No-op - ads functionality removed
    }

    public void UpdateTitle()
    {
        Title.text = "Ads Removed";
    }

    public void Receive()
    {
        // No-op - ads functionality removed
        Debug.Log("Video achievement receive called but ads are removed");
    }

    private void UpdateProgressValue()
    {
        // No-op - ads functionality removed
    }
    
    private void ManageExclamationPoint()
    {
        if (VideoExclamationPoint != null)
        {
            VideoExclamationPoint.SetActive(false);
        }
    }

    private void TriggerBarRefresh()
    {
        // No-op - ads functionality removed
    }
    
    private void UpdateRewardCounter()
    {
        // No-op - ads functionality removed
    }
}
