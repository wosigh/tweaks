#luna-send -n 1 palm://org.e.lnx.wee.webostweaks/del {\"owner\":\"patch-personal-id\"}

#luna-send -n 1 palm://org.e.lnx.wee.webostweaks/add {\"owner\":\patch-personal-id\",\"category\":\"system\",\"prefs\":[{\"type\":\"toggle-button\",\"group\":\"behavior\",\"key\":\"testKeyOne\",\"restart\":\"luna\",\"label\":\"Toggle\ Test\",\"value\":false},{\"type\":\"integer-picker\",\"group\":\"behavior\",\"key\":\"testKeyTwo\",\"restart\":\"luna\",\"label\":\"Value\ Picker\ Test\",\"value\":50,\"min\":0,\"max\":100},{\"type\":\"list-selector\",\"group\":\"uber\ group\",\"key\":\"testKeyUber\",\"restart\":\"luna\",\"label\":\"Uber\ List\ Test\",\"value\":\"default\",\"choices\":[{\"label\":\"Cool\",\"value\":\"default\"},{\"label\":\"Neat\",\"value\":\"neat\"},{\"label\":\"Wonderful\",\"value\":\"lame\"}]}]}

#luna-send -n 1 palm://org.e.lnx.wee.webostweaks/set {\"testKeyOne\":true}

#luna-send -n 1 palm://org.e.lnx.wee.webostweaks/get {\"keys\":[\"testKeyOne\"]}