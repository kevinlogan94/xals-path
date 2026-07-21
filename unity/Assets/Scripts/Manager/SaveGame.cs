using System;
using System.IO;
using UnityEngine;

/// <summary>
/// Handles game save/load functionality using JSON serialization.
/// Modern, cross-platform, and human-readable save format.
/// </summary>
public static class SaveGame
{
    private static readonly string SavePath = Application.persistentDataPath + "/XalsPathGame.json";
    private const bool loadSavedGame = true;
    
    public static void Save()
    {
        try
        {
            // Store all the saved data we need here
            var savedData = new SavedData();

            // Serialize to JSON (pretty print for readability)
            string json = JsonUtility.ToJson(savedData, true);
            
            // Write to file
            File.WriteAllText(SavePath, json);
            
            Debug.Log($"Game saved successfully to: {SavePath}");
        }
        catch (Exception e)
        {
            Debug.LogError($"Failed to save game: {e.Message}");
            Debug.LogException(e);
        }
    }

    public static void Delete()
    {
        try
        {
            if (File.Exists(SavePath))
            {
                File.Delete(SavePath);
                Debug.Log($"Save file deleted: {SavePath}");
            }
            SavedData.RefreshData();
        }
        catch (Exception e)
        {
            Debug.LogError($"Failed to delete save file: {e.Message}");
            Debug.LogException(e);
        }
    }

    public static void Load()
    {
        SavedData.RefreshData();
        if (!loadSavedGame) return;
        
        if (File.Exists(SavePath))
        {
            LoadFromJson();
        }
        else
        {
            Debug.Log("No save file found. Starting fresh game.");
            Debug.Log($"Save file will be created at: {SavePath}");
        }
    }

    private static void LoadFromJson()
    {
        try
        {
            string json = File.ReadAllText(SavePath);
            var savedData = JsonUtility.FromJson<SavedData>(json);
            
            if (savedData != null)
            {
                savedData.DistributeLoadData();
                Debug.Log($"Game loaded successfully from: {SavePath}");
            }
            else
            {
                Debug.LogError("Failed to deserialize save data from JSON");
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"Failed to load game from JSON: {e.Message}");
            Debug.LogException(e);
            Debug.Log("Starting fresh game instead.");
        }
    }

    public static bool SaveFileExists()
    {
        return File.Exists(SavePath);
    }
    
    /// <summary>
    /// Returns the full path to the save file for debugging
    /// </summary>
    public static string GetSaveFilePath()
    {
        return SavePath;
    }
}

