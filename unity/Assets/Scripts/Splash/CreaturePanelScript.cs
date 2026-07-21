using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class CreaturePanelScript : MonoBehaviour
{
    public Creature Creature;
    public Image Image;
    public TextMeshProUGUI Title;
    public TextMeshProUGUI Description;

    private Animator _animator;
    
    #region Singleton
    public static CreaturePanelScript Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion

    void Start()
    {
        
    }
    
    // Update is called once per frame
    void Update()
    {
        Title.text = Creature.Name;
        Description.text = Creature.Description;
        if (Image.IsActive())
        {
            if (_animator == null)
            {
                _animator = Image.GetComponent<Animator>();
            }
            _animator.Play(Creature.CreatureAnimation.ToString());
        }
    }
}
