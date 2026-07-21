using UnityEngine;

[CreateAssetMenu(fileName = "New Helper", menuName = "Helper")]
public class Helper : ScriptableObject
{
    public string Name;
    public string Description;
    public int LevelRequirement;
    public int Cost;
    public long DynamicCost;
    public int Increment;
    public long DynamicIncrement;
    public int AmountOwned;
    public Creature Creature;
    public Sprite Artwork;
}