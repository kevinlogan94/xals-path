using System;
using System.Linq;
using System.Runtime.Serialization;
using CloudOnce;
using UnityEngine;

// https://gamegorillaz.com/blog/game-center-setup-in-unity/
public class GameCenterManager : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        if (Application.platform != RuntimePlatform.Android || Monitor.useAllCloudServices)
        {
            Cloud.SignIn(false, result =>
            {
                Debug.Log($"Cloud Services Sign in Status: {result}");
            });
        }
    }

    public static void ReportAchievementUnlocked(string achievementId)
    {
        if (!Cloud.IsSignedIn)
        {
            Debug.Log("Player is not signed in. Cancelling achievement unlock.");
            return;
        }

        if (Application.platform == RuntimePlatform.Android)
        {
            achievementId = ((GooglePlayAchievement)Enum.Parse(typeof(GooglePlayAchievement), achievementId)).Value();
        }
        var achievement = Achievements.All.FirstOrDefault(x => x.ID == achievementId);
        if (achievement == null)
        {
            Debug.Log($"Not Found: Achievement {achievementId} was not found when trying to report progress for {Cloud.PlayerDisplayName}.");
            return;
        }
        if (achievement.IsUnlocked)
        {
            Debug.Log($"Completed: Achievement {achievementId} has already been completed by {Cloud.PlayerDisplayName}");
            return;
        }
        
        achievement.Unlock(success =>
        {
            if (success.Result)
            {
                Debug.Log($"Progress reported successfully for {Cloud.PlayerDisplayName} on achievement: {achievementId}");
                if (Monitor.UseAnalytics)
                {
                    AnalyticsManager.AchievementUnlocked(achievementId);
                }
                return;
            }
            Debug.Log($"Progress report failed for user {Cloud.PlayerDisplayName} on achievement: {achievementId}");
        });
    }

    // public void PostScoreOnLeaderBoard(int myScore)
    // {
    //     if (Social.localUser.authenticated)
    //     {
    //         Social.ReportScore(myScore, LeaderBoardId, success =>
    //         {
    //             if (success)
    //             {
    //                 Debug.Log($"Score reported successfully for {Social.localUser.userName} on leaderboard {LeaderBoardId}");
    //                 return;
    //             }
    //             Debug.Log($"Score report failed for {Social.localUser.userName} on leaderboard {LeaderBoardId}");
    //         });
    //     }
    // }
    public enum GameCenterAchievement
    {
        [EnumMember(Value = "master")]
        Master,
        [EnumMember(Value = "scholar")]
        Scholar,
        [EnumMember(Value = "caster")]
        Caster,
        [EnumMember(Value = "high_achiever")]
        HighAchiever,
        [EnumMember(Value = "follower")]
        Follower,
        [EnumMember(Value = "end_of_an_age")]
        EndOfAnAge,
        [EnumMember(Value = "tapper")]
        Tapper,
        [EnumMember(Value = "the_beginning")]
        Beginning,
        [EnumMember(Value = "welcome_back")]
        WelcomeBack,
        [EnumMember(Value = "cycle")]
        Cycle,
        [EnumMember(Value = "appraiser")]
        Appraiser,
        [EnumMember(Value = "thank_you")]
        ThankYou,
        [EnumMember(Value = "collector")]
        Collector,
        [EnumMember(Value = "traveler")]
        Traveler,
        [EnumMember(Value = "guardian")]
        Guardian
    }
    
    // ReSharper disable InconsistentNaming
    private enum GooglePlayAchievement
    {
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQDA")]
        master,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQCQ")]
        scholar,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQAw")]
        caster,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQCA")]
        high_achiever,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQBg")]
        follower,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQBQ")]
        end_of_an_age,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQCg")]
        tapper,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQAg")]
        the_beginning,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQAA")]
        welcome_back,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQBA")]
        cycle,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQAQ")]
        appraiser,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQCw")]
        thank_you,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQDQ")]
        collector,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQDg")]
        traveler,
        [EnumMember(Value = "CgkIrZfJ_dMZEAIQBw")]
        guardian
    }
}