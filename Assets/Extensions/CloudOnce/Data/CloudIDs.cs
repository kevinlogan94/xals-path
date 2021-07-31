// <copyright file="CloudIDs.cs" company="Jan Ivar Z. Carlsen, Sindri Jóelsson">
// Copyright (c) 2016 Jan Ivar Z. Carlsen, Sindri Jóelsson. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>

namespace CloudOnce
{
#if (UNITY_ANDROID || UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
    using Internal;
    using UnityEngine;
#endif
    /// <summary>
    /// Provides access to achievement- and leaderboard IDs registered via the CloudOnce Editor.
    /// This file was automatically generated by CloudOnce. Do not edit.
    /// </summary>
    public static class CloudIDs
    {
        /// <summary>
        /// Contains properties that retrieves achievement IDs for the current platform.
        /// </summary>
        public static class AchievementIDs
        {
            public static string welcome_back
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQAA";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "welcome_back";
#elif UNITY_EDITOR
                    return "welcome_back";
#else
                    return string.Empty;
#endif
                }
            }

            public static string appraiser
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQAQ";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "appraiser";
#elif UNITY_EDITOR
                    return "appraiser";
#else
                    return string.Empty;
#endif
                }
            }

            public static string follower
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQBg";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "follower";
#elif UNITY_EDITOR
                    return "follower";
#else
                    return string.Empty;
#endif
                }
            }

            public static string the_beginning
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQAg";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "the_beginning";
#elif UNITY_EDITOR
                    return "the_beginning";
#else
                    return string.Empty;
#endif
                }
            }

            public static string thank_you
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQCw";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "thank_you";
#elif UNITY_EDITOR
                    return "thank_you";
#else
                    return string.Empty;
#endif
                }
            }

            public static string collector
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQDQ";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "collector";
#elif UNITY_EDITOR
                    return "collector";
#else
                    return string.Empty;
#endif
                }
            }

            public static string traveler
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQDg";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "traveler";
#elif UNITY_EDITOR
                    return "traveler";
#else
                    return string.Empty;
#endif
                }
            }

            public static string guardian
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQBw";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "guardian";
#elif UNITY_EDITOR
                    return "guardian";
#else
                    return string.Empty;
#endif
                }
            }

            public static string cycle
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQBA";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "cycle";
#elif UNITY_EDITOR
                    return "cycle";
#else
                    return string.Empty;
#endif
                }
            }

            public static string tapper
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQCg";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "tapper";
#elif UNITY_EDITOR
                    return "tapper";
#else
                    return string.Empty;
#endif
                }
            }

            public static string end_of_an_age
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQBQ";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "end_of_an_age";
#elif UNITY_EDITOR
                    return "end_of_an_age";
#else
                    return string.Empty;
#endif
                }
            }

            public static string high_achiever
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQCA";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "high_achiever";
#elif UNITY_EDITOR
                    return "high_achiever";
#else
                    return string.Empty;
#endif
                }
            }

            public static string caster
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQAw";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "caster";
#elif UNITY_EDITOR
                    return "caster";
#else
                    return string.Empty;
#endif
                }
            }

            public static string scholar
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQCQ";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "scholar";
#elif UNITY_EDITOR
                    return "scholar";
#else
                    return string.Empty;
#endif
                }
            }

            public static string master
            {
                get
                {
#if UNITY_ANDROID && !UNITY_EDITOR
#if CLOUDONCE_GOOGLE
                    return "CgkIrZfJ_dMZEAIQDA";
#else
                    return string.Empty;
#endif
#elif (UNITY_IOS || UNITY_TVOS) && !UNITY_EDITOR
                    return "master";
#elif UNITY_EDITOR
                    return "master";
#else
                    return string.Empty;
#endif
                }
            }
        }

        /// <summary>
        /// Contains properties that retrieves leaderboard IDs for the current platform.
        /// </summary>
        public static class LeaderboardIDs
        {
        }
    }
}
