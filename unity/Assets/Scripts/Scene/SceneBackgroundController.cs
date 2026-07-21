using UnityEngine;
using UnityEngine.UI;

public class SceneBackgroundController : MonoBehaviour
{
    private Sprite _genericImage;
    private Sprite _genericDownImage;
    private Sprite _happyImage;
    private Sprite _originalImage;
    private Sprite _sadImage;
    private Sprite _sadSideImage;
    private Sprite _shockedImage;
    private Sprite _angryImage;
    private Sprite _shockedDownImage;
    
    #region Singleton
    public static SceneBackgroundController Instance;
    #endregion
    
    void Awake()
    {
        Instance = this;
        
        _genericImage = Resources.Load<Sprite>("Game/Characters/Xal/xal_generic");
        _genericDownImage = Resources.Load<Sprite>("Game/Characters/Xal/xal_generic_down");
        _happyImage = Resources.Load<Sprite>("Game/Characters/Xal/xal_happy");
        _originalImage = Resources.Load<Sprite>("Game/Characters/Xal/xal_generic");
        _sadImage = Resources.Load<Sprite>("Game/Characters/Xal/xal_sad");
        _sadSideImage = Resources.Load<Sprite>("Game/Characters/Xal/xal_sad_side");
        _shockedImage = Resources.Load<Sprite>("Game/Characters/Xal/xal_shocked");
        _shockedDownImage = Resources.Load<Sprite>("Game/Characters/Xal/xal_shocked_side");
        _angryImage = Resources.Load<Sprite>("Game/Characters/Xal/xal_mad");
    }

    public void UpdateSceneBackground(Expression expression)
    {
        Sprite spriteToUse;
        switch (expression.ToString())
        {
            case "Generic":
                spriteToUse = _genericImage;
                break;
            case "GenericDown":
                spriteToUse = _genericDownImage;
                break;
            case "Angry":
                spriteToUse = _angryImage;
                break;
            case "Happy":
                spriteToUse = _happyImage;
                break;
            case "Sad":
                spriteToUse = _sadImage;
                break;
            case "SadSide":
                spriteToUse = _sadSideImage;
                break;
            case "Shocked":
                spriteToUse = _shockedImage;
                break;
            case "ShockedDown":
                spriteToUse = _shockedDownImage;
                break;
            case "Original":
                spriteToUse = _originalImage;
                break;
            default:
                spriteToUse = _originalImage;
                break;
        }
        gameObject.GetComponent<Image>().sprite = spriteToUse;
    }
}

public enum BookAnimation
{
    BookSit,
    BookTurn
}