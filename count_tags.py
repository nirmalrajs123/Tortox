import sys

if True:
    file_path = r'c:\Tortox\frontend\src\components\product.jsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print("--- Specifications declarations ---")
    for i, line in enumerate(lines):
        if 'Specifications' in line and 'activeTab' in line:
            print(f"Line {i+1}: {line.strip()}")

    print("--- Categories declarations ---")
    for i, line in enumerate(lines):
        if 'category && (' in line:
            print(f"Line {i+1}: {line.strip()}")
            # Print next 30 lines Node flawless
            for j in range(1, 25):
                if i + j < len(lines):
                    print(f"  +{j}: {lines[i+j].rstrip()}")
