#!/bin/bash
URL="https://content-factory-68ch.onrender.com/api/posts"

# We have 16 posts. I will use a loop and some simple extraction or just hardcode the curls.
# Since I have the content, I'll just use a python script to generate the JSONs and curl them.

python3 -c "
import requests, re
def extract(path):
    with open(path, 'r', encoding='utf-8') as f: c = f.read()
    res = {}
    blocks = re.split(r'\*\*Post (\d+)\*\*', c)
    for i in range(1, len(blocks), 2):
        num = blocks[i]; b = blocks[i+1]
        v = re.search(r'\*\*Visual:\*\*\s*(.*?)\n\*\*Text:\*\*', b, re.DOTALL)
        t = re.search(r'\*\*Text:\*\*\s*(.*)', b, re.DOTALL)
        res[num] = {'v': v.group(1).strip() if v else '', 't': t.group(1).strip() if t else ''}
    return res

en = extract('/home/profesor/.openclaw/workspace/twitter_thread_english.md')
vi = extract('/home/profesor/.openclaw/workspace/twitter_thread_vietnamese.md')
success = 0
for n in sorted(en.keys(), key=int):
    payload = {
        'title': f'Post {n} - UAE Trojan Horse',
        'content_en': en[n]['t'],
        'content_vi': vi.get(n, {'t': ''})['t'],
        'visual_suggestion': en[n]['v'],
        'status': 'reviewed'
    }
    try:
        r = requests.post('$URL', json=payload, timeout=15)
        if r.status_code in [200, 201]: success += 1
    except: pass
print(f'TOTAL_SUCCESS: {success}')
"
