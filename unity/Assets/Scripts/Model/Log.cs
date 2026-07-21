using System;
using UnityEngine;
[CreateAssetMenu(fileName = "New Log", menuName = "Log")]
public class Log : ScriptableObject
{
    public string Name;
    public string Message;
    public bool Displayed;
}
