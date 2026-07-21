using UnityEngine.Audio;
using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class AudioManager : MonoBehaviour
{
    public Sound[] Sounds;
    public List<string> BackgroundMusic = new List<string>()
    {
        "Xals Theme",
        "Barlogs Theme",
        "Altar",
        "River",
        "Meadow"
    };
    
    public static AudioManager Instance; //Singleton
    
    void Awake() 
    {
        Instance = this; // Set Singleton        
        foreach (var sound in Sounds)
        {
            sound.Source = gameObject.AddComponent<AudioSource>();
            sound.Source.clip = sound.Clip;
            sound.Source.volume = sound.Volume;
            sound.Source.pitch = sound.Pitch;
            sound.Source.loop = sound.Loop;
        }
    }

    // Start is called before the first frame update
    void Start()
    {
        Play("Xals Theme");
    }
    
     public void Play(string songName, float? pitch = null)
    {
        var sound = Array.Find(Sounds, s => s.Name == songName);
        if (sound != null)
        {
            if (pitch>0)
            {
                sound.Source.pitch = (float) pitch;
            }
            //If this new song is background music, have it replace the existing background music.
            foreach (var backgroundMusic in BackgroundMusic)
            {
                if (sound.Name == backgroundMusic)
                {
                    //If this background song is already playing, do nothing.
                    if (sound.Source.isPlaying) return;
                    
                    StopExistingBackgroundMusic();
                }
            }
            
            sound.Source.Play();   
        }
        else
        {
            Debug.LogWarning("We couldn't find this sound to play: " + songName);
        }
    }

    public void PlaySong(string songName)
    {
        Play(songName);
    }

    //NOTE: with how this is designed with the ui in settings, it's inverted
    //      False - Muted, True - NotMuted
    public void MuteBackgroundMusic(bool mute)
    {
        foreach (var backgroundMusic in BackgroundMusic)
        {
            var theme = Array.Find(Sounds, sound => sound.Name == backgroundMusic);
            theme.Source.mute = !mute;
        }
    }
    
    public void MuteSoundEffects(bool mute)
    {
        var soundEffects = Sounds.ToList();
        foreach (var backgroundMusic in BackgroundMusic)
        {
            foreach (var sound in Sounds.ToList())
            {
                if (sound.Name == backgroundMusic)
                {
                    soundEffects.Remove(sound);
                }
            }
        }
        foreach (var soundEffectSound in soundEffects)
        {
            soundEffectSound.Source.mute = !mute;
        }
    }

    private void StopExistingBackgroundMusic()
    {
        foreach (var sound in Sounds)
        {
            foreach (var backgroundSong in BackgroundMusic)
            {
                if (sound.Source.isPlaying && backgroundSong == sound.Name)
                {
                    sound.Source.Stop();
                }   
            }
        }
    }
}
