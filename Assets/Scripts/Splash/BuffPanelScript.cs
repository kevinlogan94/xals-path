using UnityEngine;

public class BuffPanelScript : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void CollectAndCloseSplash()
    {
        BuffManager.Instance.TriggerBuff(BuffType.Mana, 15);
        SplashManager.Instance.CloseSplash();
    }

    public void WatchAdAndCloseSplash()
    {
        // Watch ad for 30 second buff (2x longer than baseline)
        AdvertisementManager.Instance.ShowBuffRewardAd(BuffType.Mana, 30);
        SplashManager.Instance.CloseSplash();
    }
}
