// <copyright file="Achievements.cs" company="Jan Ivar Z. Carlsen, Sindri Jóelsson">
// Copyright (c) 2016 Jan Ivar Z. Carlsen, Sindri Jóelsson. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>

namespace CloudOnce
{
    using System.Collections.Generic;
    using Internal;

    /// <summary>
    /// Provides access to achievements registered via the CloudOnce Editor.
    /// This file was automatically generated by CloudOnce. Do not edit.
    /// </summary>
    public static class Achievements
    {
        private static readonly UnifiedAchievement s_welcome_back = new UnifiedAchievement("welcome_back",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "welcome_back"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQAA"
#else
            "welcome_back"
#endif
            );

        public static UnifiedAchievement welcome_back
        {
            get { return s_welcome_back; }
        }

        private static readonly UnifiedAchievement s_appraiser = new UnifiedAchievement("appraiser",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "appraiser"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQAQ"
#else
            "appraiser"
#endif
            );

        public static UnifiedAchievement appraiser
        {
            get { return s_appraiser; }
        }

        private static readonly UnifiedAchievement s_follower = new UnifiedAchievement("follower",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "follower"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQBg"
#else
            "follower"
#endif
            );

        public static UnifiedAchievement follower
        {
            get { return s_follower; }
        }

        private static readonly UnifiedAchievement s_the_beginning = new UnifiedAchievement("the_beginning",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "the_beginning"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQAg"
#else
            "the_beginning"
#endif
            );

        public static UnifiedAchievement the_beginning
        {
            get { return s_the_beginning; }
        }

        private static readonly UnifiedAchievement s_thank_you = new UnifiedAchievement("thank_you",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "thank_you"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQCw"
#else
            "thank_you"
#endif
            );

        public static UnifiedAchievement thank_you
        {
            get { return s_thank_you; }
        }

        private static readonly UnifiedAchievement s_collector = new UnifiedAchievement("collector",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "collector"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQDQ"
#else
            "collector"
#endif
            );

        public static UnifiedAchievement collector
        {
            get { return s_collector; }
        }

        private static readonly UnifiedAchievement s_traveler = new UnifiedAchievement("traveler",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "traveler"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQDg"
#else
            "traveler"
#endif
            );

        public static UnifiedAchievement traveler
        {
            get { return s_traveler; }
        }

        private static readonly UnifiedAchievement s_guardian = new UnifiedAchievement("guardian",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "guardian"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQBw"
#else
            "guardian"
#endif
            );

        public static UnifiedAchievement guardian
        {
            get { return s_guardian; }
        }

        private static readonly UnifiedAchievement s_cycle = new UnifiedAchievement("cycle",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "cycle"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQBA"
#else
            "cycle"
#endif
            );

        public static UnifiedAchievement cycle
        {
            get { return s_cycle; }
        }

        private static readonly UnifiedAchievement s_tapper = new UnifiedAchievement("tapper",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "tapper"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQCg"
#else
            "tapper"
#endif
            );

        public static UnifiedAchievement tapper
        {
            get { return s_tapper; }
        }

        private static readonly UnifiedAchievement s_end_of_an_age = new UnifiedAchievement("end_of_an_age",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "end_of_an_age"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQBQ"
#else
            "end_of_an_age"
#endif
            );

        public static UnifiedAchievement end_of_an_age
        {
            get { return s_end_of_an_age; }
        }

        private static readonly UnifiedAchievement s_high_achiever = new UnifiedAchievement("high_achiever",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "high_achiever"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQCA"
#else
            "high_achiever"
#endif
            );

        public static UnifiedAchievement high_achiever
        {
            get { return s_high_achiever; }
        }

        private static readonly UnifiedAchievement s_caster = new UnifiedAchievement("caster",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "caster"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQAw"
#else
            "caster"
#endif
            );

        public static UnifiedAchievement caster
        {
            get { return s_caster; }
        }

        private static readonly UnifiedAchievement s_scholar = new UnifiedAchievement("scholar",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "scholar"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQCQ"
#else
            "scholar"
#endif
            );

        public static UnifiedAchievement scholar
        {
            get { return s_scholar; }
        }

        private static readonly UnifiedAchievement s_master = new UnifiedAchievement("master",
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_TVOS)
            "master"
#elif !UNITY_EDITOR && UNITY_ANDROID && CLOUDONCE_GOOGLE
            "CgkIrZfJ_dMZEAIQDA"
#else
            "master"
#endif
            );

        public static UnifiedAchievement master
        {
            get { return s_master; }
        }

        public static readonly UnifiedAchievement[] All =
        {
            s_welcome_back,
            s_appraiser,
            s_follower,
            s_the_beginning,
            s_thank_you,
            s_collector,
            s_traveler,
            s_guardian,
            s_cycle,
            s_tapper,
            s_end_of_an_age,
            s_high_achiever,
            s_caster,
            s_scholar,
            s_master,
        };

        public static string GetPlatformID(string internalId)
        {
            return s_achievementDictionary.ContainsKey(internalId)
                ? s_achievementDictionary[internalId].ID
                : string.Empty;
        }

        private static readonly Dictionary<string, UnifiedAchievement> s_achievementDictionary = new Dictionary<string, UnifiedAchievement>
        {
            { "welcome_back", s_welcome_back },
            { "appraiser", s_appraiser },
            { "follower", s_follower },
            { "the_beginning", s_the_beginning },
            { "thank_you", s_thank_you },
            { "collector", s_collector },
            { "traveler", s_traveler },
            { "guardian", s_guardian },
            { "cycle", s_cycle },
            { "tapper", s_tapper },
            { "end_of_an_age", s_end_of_an_age },
            { "high_achiever", s_high_achiever },
            { "caster", s_caster },
            { "scholar", s_scholar },
            { "master", s_master },
        };
    }
}
