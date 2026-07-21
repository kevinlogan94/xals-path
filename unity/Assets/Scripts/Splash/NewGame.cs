using UnityEngine;

public class NewGame : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
    
    public void OpenSplash()
    {
        SplashManager.Instance.TriggerSplash(SplashType.NewGame.ToString());
    }
    
    public void CloseSplash()
    {
        SplashManager.Instance.CloseSplash();
    }

    public void StartNewGame()
    {
        // SaveGame.Delete();
        SavedData.RefreshData();
        SaveGame.Save();
        UnityEngine.SceneManagement.SceneManager.LoadScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene().name);
    }
}
