import os

base = '/home/z/my-project/src/app/api/hotels'

dirs_to_create = [
    os.path.join(base, chr(91) + 'hotelId' + chr(93)),
    os.path.join(base, chr(91) + 'hotelId' + chr(93), 'rooms'),
    os.path.join(base, chr(91) + 'hotelId' + chr(93), 'reviews'),
    os.path.join(base, chr(91) + 'hotelId' + chr(93), 'blackouts'),
    os.path.join(base, chr(91) + 'hotelId' + chr(93), 'blackouts', chr(91) + 'blackoutId' + chr(93)),
    os.path.join(base, chr(91) + 'hotelId' + chr(93), 'coupons'),
]

for d in dirs_to_create:
    os.makedirs(d, exist_ok=True)

# Verify by writing results to file
with open('/home/z/my-project/dir_verify.txt', 'w') as f:
    for root, dirs, files in os.walk(base):
        relpath = os.path.relpath(root, base)
        f.write(f'{relpath}/\n')
        for name in dirs:
            f.write(f'  DIR: {name} (len={len(name)})\n')
        for name in files:
            f.write(f'  FILE: {name}\n')

print('Directories created. Check /home/z/my-project/dir_verify.txt')
