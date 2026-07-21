using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.Animations;

//https://www.youtube.com/watch?v=tdSmKaJvCoA&t=815s
public class ObjectPooler : MonoBehaviour
{
    [Serializable]
    public class Pool
    {
        public string Tag;
        public GameObject Prefab;
        public GameObject Parent;
        public int Size;
    }

    #region Singleton
    public static ObjectPooler Instance;

    private void Awake()
    {
        Instance = this;
    }
    #endregion

    public List<Pool> Pools;
    public Dictionary<string, Queue<GameObject>> PoolDictionary;
    
    // Start is called before the first frame update
    void Start()
    {
        PoolDictionary = new Dictionary<string, Queue<GameObject>>();
        foreach (var pool in Pools)
        {
            var objectPool = GeneratePool(pool);
            PoolDictionary.Add(pool.Tag, objectPool);
        }
    }

    public GameObject SpawnFromPool(string poolTag, Vector3? position = null)
    {
        if (!PoolDictionary.ContainsKey(poolTag))
        {
            Debug.LogWarning("Pool with tag " + tag + " doesnt exist.");
            return null;
        }
        var objectToSpawn = PoolDictionary[poolTag].Dequeue();
        objectToSpawn.SetActive(true);

        if (position != null)
        {
            objectToSpawn.transform.position = (Vector3) position;
            objectToSpawn.transform.SetSiblingIndex(1); // 0 is the background
        }
        else
        {
            //this is for the numberIncrement
            var index = GameObject.Find("IncrementPanel").transform.GetSiblingIndex();
            objectToSpawn.transform.SetSiblingIndex(--index); // 0 is the background
        }

        PoolDictionary[poolTag].Enqueue(objectToSpawn);

        return objectToSpawn;
    }

    public void WipeActiveCreatureRegions()
    {
        var creatureRegionGameObjects = PoolDictionary["CreatureRegion"];
        if (creatureRegionGameObjects == null || creatureRegionGameObjects.Count == 0)
        {
            Debug.LogError("There are no creatureRegion prefabs in an object pool.");
            return;
        }
        foreach (var creature in creatureRegionGameObjects.Where(creature => creature.activeSelf))
        {
            creature.SetActive(false);
        }
    }

    private Queue<GameObject> GeneratePool(Pool pool)
    {
        var objectPool = new Queue<GameObject>();
        for (var i = 0; i < pool.Size; i++)
        {
            var obj = InstantiatePoolPrefab(pool);
            objectPool.Enqueue(obj);
        }

        return objectPool;
    }

    private GameObject InstantiatePoolPrefab(Pool pool)
    {
        var obj = Instantiate(pool.Prefab);
        obj.SetActive(false);
        // obj.GetComponent<Renderer>().enabled = true;
        if (pool.Parent != null)
        {
            //https://answers.unity.com/questions/572176/how-can-i-instantiate-a-gameobject-directly-into-a-1.html
            obj.transform.SetParent(pool.Parent.transform, false);
        }

        return obj;
    }
}
