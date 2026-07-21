#if UNITY_EDITOR && UNITY_IOS
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEditor.iOS.Xcode;
using File = System.IO.File;

// We need this for App Tracking Transparency which is a new requirement as of iOS 14
// https://audiomob.com/blog/a-unity-devs-guide-to-app-tracking-transparency-idfa-and-ios-14
// https://www.youtube.com/watch?v=D4goW0Nkw5U
public class BuildPostProcessorInfo
{
    [PostProcessBuild]
    public static void OnPostBuildProcessInfo(BuildTarget target, string pathXcode)
    {
        if (target == BuildTarget.iOS)
        {
            var infoPListPath = pathXcode + "/Info.plist";
            var document = new PlistDocument();
            document.ReadFromString(File.ReadAllText(infoPListPath));

            var elementDict = document.root;
            elementDict.SetString("NSUserTrackingUsageDescription", "This identifier will be used to deliver personalized ads to you.");
            
            File.WriteAllText(infoPListPath, document.WriteToString());
        }
    } 
}
#endif