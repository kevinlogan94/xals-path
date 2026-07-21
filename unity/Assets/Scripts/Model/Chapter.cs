using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "New Chapter", menuName = "Chapter")]
public class Chapter : ScriptableObject
{
    public string Name;
    public int Number;
    public int LevelRequirement;
    public bool SceneViewed;
    public string[] Quotes;
    public Expression[] Expressions;
    public Dictionary<Expression, string> Interactions;
}

public enum Expression
{
    Generic,
    GenericDown,
    Happy,
    Original,
    Angry,
    SadSide,
    Sad,
    Shocked,
    ShockedDown
}
