import os

project_root = r"C:\Users\ADITYA\.gemini\antigravity\scratch\artha-ai"
matches = []

for root, dirs, files in os.walk(project_root):
    if "node_modules" in root or ".git" in root or "__pycache__" in root or "dist" in root or "build" in root:
        continue
    for file in files:
        if file.endswith((".py", ".tsx", ".ts", ".js", ".jsx", ".md", ".json", ".bat")):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    lines = f.readlines()
                    for idx, line in enumerate(lines, 1):
                        if "@artha.local" in line:
                            matches.append((file_path, idx, line.strip()))
            except Exception as e:
                pass

print("==================================================")
print("  @artha.local AUDIT SEARCH RESULTS")
print("==================================================")
if matches:
    print(f"Found {len(matches)} occurrences of @artha.local:")
    for path, line_no, content in matches:
        print(f"  {path}:{line_no} -> {content}")
else:
    print("0 OCCURRENCES OF @artha.local FOUND IN PROJECT REPOSITORY!")
print("==================================================")
