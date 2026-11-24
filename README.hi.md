# opencode-todo

[Português](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [हिन्दी](README.hi.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[OpenCode](https://opencode.ai) के लिए प्रति सत्र TODO सूची वाला plugin। एजेंट `todo_write` और `todo_list` टूल के ज़रिए TODO आइटम बनाता/अपडेट करता है; TUI साइडबार और `/todos` से खुले panel में प्रगति दिखाता है।

![साइडबार में TODO सूची का पूर्वावलोकन](docs/todo-preview.svg)

## विशेषताएँ

- प्रति सत्र सूची, जो OpenCode के storage में सहेजी जाती है।
- subagents मुख्य सत्र की सूची अपडेट करते हैं।
- RPC के ज़रिए real-time अपडेट।
- प्रत्येक status के लिए आइकन और रंग, line wrap पर alignment के साथ।
- सूची देखने और साफ़ करने के लिए `/todos` panel।

## इंस्टॉलेशन

repository को OpenCode के plugins folder में clone करें और dependencies इंस्टॉल करें:

```bash
git clone https://github.com/juliano340/opencode-todo.git ~/.config/opencode/plugins/opencode-todo
cd ~/.config/opencode/plugins/opencode-todo
npm install
```

Windows पर, उदाहरण के लिए इसके बराबर folder का उपयोग करें:

```powershell
git clone https://github.com/juliano340/opencode-todo.git "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
cd "$env:USERPROFILE\.config\opencode\plugins\opencode-todo"
npm install
```

अपने global `opencode.json` में `plugins` के अंतर्गत folder का absolute path जोड़ें:

```jsonc
{
  "plugins": [
    "C:/Users/<usuario>/.config/opencode/plugins/opencode-todo"
  ]
}
```

OpenCode reload करें या `/reload` का उपयोग करें। अगर sidebar अपने-आप अपडेट न हो, तो `/reload` दोबारा चलाएँ।

## उपयोग

एजेंट काम के दौरान सूची अपने-आप बनाए रखता है। आप ये भी कर सकते हैं:

- `/todos` से panel खोलें।
- सूची साफ़ करने के लिए, confirmation के साथ `c` दबाएँ।
- panel बंद करने के लिए `Esc` दबाएँ।

### स्थिति

| स्थिति | आइकन | दिखावट |
| --- | --- | --- |
| `pending` | `•` | तटस्थ मार्कर, सामान्य text |
| `in_progress` | `▸` | theme के चेतावनी रंग वाला मार्कर और text |
| `completed` | `✓` | सफलता रंग वाला मार्कर, हल्का text |

लंबे text शीर्षक के नीचे wrap होते हैं और आइकन column में वापस नहीं आते।

## व्यवहार

- डेटा `todos/<sessionID>` में रहता है और restart के बाद भी बना रहता है।
- जब कोई subagent लिखता है, तो सूची मुख्य sidebar में दिखाई देने के लिए मुख्य सत्र में सहेजी जाती है।
- समान title वाले आइटम अपडेट के बीच अपना `id` बनाए रखते हैं।
- जब सभी आइटम पूरे हो जाते हैं, तो अगला prompt केवल मौजूदा काम दिखाने के लिए सूची साफ़ कर देता है।
- TUI, RPC (`todo.list`) से पढ़ता है और `todo.changed` event सुनता है।

## मॉडल के लिए टूल

### `todo_write`

पूरी सूची replace करता है। हमेशा सभी आइटम भेजें, केवल बदलाव नहीं।

```json
{
  "todos": [
    { "title": "endpoint लागू करना", "status": "completed" },
    { "title": "एकीकरण की जाँच करना", "status": "in_progress" },
    { "title": "release प्रकाशित करना", "status": "pending" }
  ]
}
```

### `todo_list`

सत्र की मौजूदा सूची पढ़ता है।

## संरचना

| फ़ाइल | ज़िम्मेदारी |
| --- | --- |
| `src/rpc.ts` | RPC अनुबंध: `todo.list`, `todo.clear` और `todo.changed` event |
| `src/index.ts` | टूल, storage, RPC और स्वचालित सफ़ाई |
| `src/tui.tsx` | sidebar में block और `/todos` panel |

## विकास

```bash
npm install
npx tsc --noEmit
```

आवश्यकताएँ: OpenCode TUI plugin API और Bun-compatible runtime, जैसा कि `package.json` में बताया गया है।

## लाइसेंस

[MIT](LICENSE) © 2026 Juliano Pereira.
