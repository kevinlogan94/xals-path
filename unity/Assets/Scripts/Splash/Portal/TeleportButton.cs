using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class TeleportButton : MonoBehaviour
{
    public CanvasBackground Background;
    
    private AudioManager _audioManager;
    
    private Sprite _disableTeleportButtonImage;
    private Sprite _activeTeleportButtonImage;
    
    // Start is called before the first frame update
    void Start()
    {
        _audioManager = FindObjectOfType<AudioManager>();
        _disableTeleportButtonImage = Resources.Load<Sprite>("Pixel/buttons/reviewGameButton");
        _activeTeleportButtonImage = Resources.Load<Sprite>("Pixel/buttons/blueButton");
    }

    // Update is called once per frame
    void Update()
    {
        if (CanvasBackgroundController.Instance.CurrentCanvasBackground == Background)
        {
            gameObject.GetComponent<Button>().image.sprite = _disableTeleportButtonImage;
        }
        else
        {
            gameObject.GetComponent<Button>().image.sprite = _activeTeleportButtonImage;
        }
    }

    public void PerformTeleport()
    {
        if (CanvasBackgroundController.Instance.CurrentCanvasBackground != Background)
        {
            GameCenterManager.ReportAchievementUnlocked(GameCenterManager.GameCenterAchievement.Traveler.Value());
            ObjectPooler.Instance.WipeActiveCreatureRegions(); // We need to wipe what creatures are already there that don't belong in this new region.
            CanvasBackgroundController.Instance.UpdateCanvasBackground(Background);
            ManaBar.Instance.DeductAllMana();
            _audioManager.Play("MagicSpell");
        }
    }
}
