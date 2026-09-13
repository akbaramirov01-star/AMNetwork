"""
Guards the one mistake that has now broken a Render deploy twice: adding a
module that api.py imports, but forgetting to add it to the Dockerfile's
COPY line. The container then dies at startup with ModuleNotFoundError and
the deploy fails — with nothing wrong in the code itself.

Walks every local module api.py imports (transitively) and asserts each one
is actually copied into the image.

Run: python test_dockerfile.py
"""
import ast
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def copied_files():
    """The set of .py files the Dockerfile copies into the image."""
    with open(os.path.join(HERE, "Dockerfile"), encoding="utf-8") as f:
        dockerfile = f.read()
    copied = set()
    for line in dockerfile.splitlines():
        m = re.match(r"^COPY\s+(.*?)\s+\./?$", line.strip())
        if not m:
            continue
        for part in m.group(1).split():
            if part.endswith(".py"):
                copied.add(part)
    return copied


def local_modules():
    """Every local module reachable from api.py, following imports transitively."""
    available = {f[:-3] for f in os.listdir(HERE) if f.endswith(".py")}
    seen, queue = set(), ["api"]
    while queue:
        name = queue.pop()
        if name in seen:
            continue
        seen.add(name)
        path = os.path.join(HERE, name + ".py")
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=path)
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.level == 0 and node.module in available:
                queue.append(node.module)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name in available:
                        queue.append(alias.name)
    return seen


def main():
    copied = copied_files()
    needed = local_modules()
    missing = sorted(m + ".py" for m in needed if m + ".py" not in copied)

    print("Dockerfile copies:", " ".join(sorted(copied)))
    print("api.py needs:     ", " ".join(sorted(m + '.py' for m in needed)))

    if missing:
        print("\nFAIL — imported by api.py but NOT copied into the image:")
        for name in missing:
            print("  -", name)
        print("\nThe container would die on startup with ModuleNotFoundError.")
        print("Add these to the COPY line in ai_scoring/Dockerfile.")
        return 1

    print("\nOK — every module api.py imports is copied into the image.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
