using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Video;

//https://stackoverflow.com/questions/41144054/using-new-unity-videoplayer-and-videoclip-api-to-play-video
public class PlayIntro : MonoBehaviour
{
    //Raw Image to Show Video Images [Assign from the Editor]
    public RawImage image;
    //Video To Play [Assign from the Editor]
    public VideoClip videoToPlay;

    public GameObject loadPanel;

    private VideoPlayer _videoPlayer;
    private VideoSource _videoSource;

    // Start is called before the first frame update
    void Start()
    {
        Application.runInBackground = true;
        StartCoroutine(PlayVideoThenTransition());
    }
    
    IEnumerator PlayVideoThenTransition()
    {
        //Add VideoPlayer to the GameObject
        _videoPlayer = gameObject.AddComponent<VideoPlayer>();

        //Disable Play on Awake for Video
        _videoPlayer.playOnAwake = false;

        //We want to play from video clip not from url
        _videoPlayer.source = VideoSource.VideoClip;

        //Set video To Play then prepare Audio to prevent Buffering
        _videoPlayer.clip = videoToPlay;
        _videoPlayer.Prepare();

        //Wait until video is prepared
        while (!_videoPlayer.isPrepared)
        {
            Debug.Log("Preparing Video");
            yield return null;
        }

        Debug.Log("Done Preparing Video");

        //Assign the Texture from Video to RawImage to be displayed
        image.texture = _videoPlayer.texture;

        //Play Video
        _videoPlayer.Play();

        Debug.Log("Playing Video");
        while (_videoPlayer.isPlaying)
        {
            var videoTime = _videoPlayer.time;
            if (videoTime >= 0.25)
            {
                //Hide the load panel
                loadPanel.SetActive(false);       
            }
            Debug.LogWarning("Video Time: " + Mathf.FloorToInt((float)videoTime));
            yield return null;
        }
        Debug.Log("Done Playing Video");
        
        TransitionToMainScene();
    }

    public void TransitionToMainScene()
    {
        UnityEngine.SceneManagement.SceneManager.LoadScene("MainScene");
    }
}
