import os
import sys
import stat
import json

chunk_size = 200

def isHidden(item, item_stat=None):
    if item.name.startswith("."):
        return True

    if os.name != "nt":
        return False

    try:
        import ctypes
        attrs = ctypes.windll.kernel32.GetFileAttributesW(item.path)

        if attrs == -1:
            return False

        return bool(attrs & 2)  # FILE_ATTRIBUTE_HIDDEN
    except:
        return False

def stream_dir(path, token):
    try:
        with os.scandir(path) as it:
            batch = []

            for i in it:
                try:
                    is_dir = i.is_dir()

                    size = 0
                    item_stat = None

                    # stat files (not dirs)
                    if not is_dir:
                        try:
                            item_stat = i.stat()
                            size = item_stat.st_size
                        except:
                            pass

                    hidden = isHidden(i, item_stat)

                    batch.append({
                        "name": i.name,
                        "path": i.path,
                        "isDir": is_dir,
                        "size": size,
                        "isHidden": hidden
                    })

                    # chunk
                    if len(batch) >= chunk_size:
                        print(json.dumps({
                            "token": token,
                            "type": "chunk",
                            "data": batch
                        }), flush=True)
                        batch = []

                except:
                    continue

            # remaining
            if batch:
                print(json.dumps({
                    "token": token,
                    "type": "chunk",
                    "data": batch
                }), flush=True)

            # done
            print(json.dumps({
                "token": token,
                "type": "done"
            }), flush=True)

    except Exception as ex:
        print(json.dumps({
            "token": token,
            "error": str(ex)
        }), flush=True)


# init signal
print(json.dumps({"type": "init"}), flush=True)


for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    try:
        cmd, path, token = line.split("|", 2)
    except ValueError:
        print(json.dumps({"error": "Invalid command"}), flush=True)
        continue

    if cmd == "list":
        stream_dir(path, token)
    else:
        print(json.dumps({
            "token": token,
            "error": f"Unknown command {cmd}"
        }), flush=True)