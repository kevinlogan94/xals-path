using System;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;

public static class Extensions
{
    //Grab the Enum Value from the EnumMember annotation.
    public static string Value(this Enum value)
    {
        var field = value
            .GetType()
            .GetField(value.ToString());

        if (field == null) return string.Empty;

        var enumMemberAttribute = GetEnumMemberAttribute(field);
        if (enumMemberAttribute != null)
        {
            return enumMemberAttribute.Value ?? string.Empty;
        }

        var descriptionAttribute = GetDescriptionAttribute(field);
        if (descriptionAttribute != null)
        {
            return descriptionAttribute.Description;
        }

        return value.ToString();
    }

    private static DescriptionAttribute GetDescriptionAttribute(FieldInfo field)
    {
        return field
            .GetCustomAttributes(typeof(DescriptionAttribute), false)
            .OfType<DescriptionAttribute>()
            .SingleOrDefault();
    }

    private static EnumMemberAttribute GetEnumMemberAttribute(FieldInfo field)
    {
        return field
            .GetCustomAttributes(typeof(EnumMemberAttribute), false)
            .OfType<EnumMemberAttribute>()
            .SingleOrDefault();
    }
}
