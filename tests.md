```hxp
loop note in notes {
  debug("Note: ", note);
  if note.type == "HOMEWORK" && note.note < 30 {
    debug("RETURNING FALSE BECAUSE A NOTE WHICH IS HOMEWORK IS LESS THAN 30");
    res false;
  }
}

res final>0 && total>0;
```