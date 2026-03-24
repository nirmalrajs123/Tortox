import sys

if True:
    file_path = r'c:\Tortox\frontend\src\components\product.jsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target = """                                        <div style={{ display: 'flex', flexDirection: 'column', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ ...labelStyle, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Model No</label><input type="text" placeholder="e.g., TX-DLX21" required value={modelNo} onChange={(e) => setModelNo(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} /></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ ...labelStyle, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Model Name</label><input type="text" placeholder="e.g., DX-21" required value={modelName} onChange={(e) => setModelName(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} /></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ ...labelStyle, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Product Name</label><input type="text" placeholder="e.g., DLX21 Mesh" required value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginTop: 0 }} /></div>
                                        </div>"""

    if target in content:
        content = content.replace(target, '                                        <div style={{ display: "none" }}></div>')
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print("Replaced successfully")
    else:
        # Try with \r\n
        target_crlf = target.replace('\n', '\r\n')
        if target_crlf in content:
            content = content.replace(target_crlf, '                                        <div style={{ display: "none" }}></div>')
            with open(file_path, 'w', encoding='utf-8', newline='') as f:
                f.write(content)
            print("Replaced successfully (CRLF)")
        else:
            print("Target not found")
