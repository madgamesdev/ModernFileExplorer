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
                except: # Permission stuff or the file not existing
                    continue
    except Exception as ex:
        return {"error": str(ex)}
    
    return items

print("init", flush=True)

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    try:
        cmd, path, token = line.split("|", 2)
    except ValueError:
        print(json.dumps({"error": "Invalid command format"}), flush=True)
        continue

    if cmd == "list":
        result = list_dir(path)
        print(json.dumps(result), flush=True)
    else:
        print(json.dumps({"error": f"Unknown command {cmd}"}), flush=True)