using UnityEngine;

public class ShopBackButton : MonoBehaviour
{
    public GameObject ShopPanel;
    private AudioManager _audioManager;
    
    // Start is called before the first frame update
    void Start()
    {
        _audioManager = FindObjectOfType<AudioManager>();
    }

    public void Back()
    {
        ShopPanel.SetActive(false);
        _audioManager.Play("DoorBell");
    }
}