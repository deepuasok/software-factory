# How a Software Factory app behaves

Ten rules. They are about behaviour, not decoration — the look is already
handled by the parts bin.

### 1. An app exists to make one decision
Name it in a sentence before building anything. The decision goes at the top of
the screen, in the largest type on the page, as a plain answer: a date, a
count, a verdict. Supporting detail sits below it.

### 2. Lead with the consequence, not the method
Show "74 weeks behind the committed date", not "model confidence 0.82". The
method belongs in a caveat line under the number, if anywhere.

### 3. The screen reacts immediately
Change an input and the consequence redraws — no Apply button, no reload. If a
change only takes effect on Save, say so on the control itself.

### 4. Direct manipulation over forms
If something gets nudged repeatedly while people argue, it is edited in place
(`InlineEdit`). Dialogs are for creating a record and for confirming something
destructive. Nothing else.

### 5. Density is a feature
These are working tools used next to a spreadsheet. Base type is 13px, rows are
tight, four stat tiles fit across. Whitespace is for separating groups, not for
looking calm.

### 6. Nothing is ever empty without a way forward
Every list, chart and panel has an empty state naming the thing and offering
the one action that creates the first one.

### 7. Colour means something
Navy is brand and primary action. Muted grey is secondary information. Red,
amber and green are status only — never decoration, never a chart series. The
six chart colours are a fixed, validated order and are never cherry-picked.

### 8. One of everything
One button, one field, one table, one map, one chart wrapper. Two ways to do
the same thing is how house style dies.

### 9. Numbers carry units and line up
Tabular figures (`cx-num`) in every column of numbers, so the eye can compare
down the column. Every figure has a unit, a suffix or a caveat.

### 10. Sample data ships with the app
Seed a believable example so the first person to open it sees the app working,
not an empty shell. Label it clearly as sample data.
