using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "New Creature", menuName = "Creature")]
public class Creature : ScriptableObject
{
    public string Name;
    public string Description;
    public CreatureAnimations CreatureAnimation;
}


