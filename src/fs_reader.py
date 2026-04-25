# ----------------------------
# ---- File System Reader ----
# ----------------------------

import os
import sys
import stat
import json

def isHidden(item, item_stat):
    if item.name.startswith("."): 
        return True # Ideally we should hide all items starting with .
    elif os.name != "nt": 
        return False # Item did not start with a . so if the os is not Windows there's not any hidden attribute to check
    
    try: 
        return bool(item_stat.st_file_attributes & stat.FILE_ATTRIBUTE_HIDDEN)
    except Exception:
        pass

    return False
    
def list_dir(path):
    items = []
    try:
        with os.scandir(path) as it:
            for i in it:
                try:
                    item_stat = i.stat()
                    items.append({
                        "name": i.name,
                        "path": i.path,
                        "isDir": i.is_dir(),
                        "size": item_stat.st_size,
                        "isHidden": isHidden(i, item_stat),
                    })
                except (PermissionError, FileNotFoundError): # Permission stuff or the file not existing
                    continue
    except Exception as ex:
        return {"error": str(ex)}
    
    return items

print("init", flush=True)

for line in sys.stdin:
    path = line.strip()

    try:
        result = list_dir(path)
        print(json.dumps(result), flush=True)
    except Exception as ex:
        print(json.dumps({"error": str(ex)}), flush=True)
