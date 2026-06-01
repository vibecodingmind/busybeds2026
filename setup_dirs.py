import os, shutil

base = '/home/z/my-project/src/app/api/hotels'

# Clean existing subdirs first
for entry in os.listdir(base):
    full = os.path.join(base, entry)
    if os.path.isdir(full):
        shutil.rmtree(full)
        print(f'Removed dir: {full}')

# Create the dynamic segment directory
segment = chr(91) + 'hotelId' + chr(93)  # [hotelId] using char codes
hotel_dir = os.path.join(base, segment)
print(f'Creating: {hotel_dir}')
os.makedirs(hotel_dir, exist_ok=True)

subdirs = [
    'rooms',
    'reviews',
    'blackouts',
    os.path.join('blackouts', chr(91) + 'blackoutId' + chr(93)),  # [blackoutId]
    'coupons',
]

for sub in subdirs:
    full_path = os.path.join(hotel_dir, sub)
    os.makedirs(full_path, exist_ok=True)
    print(f'Created: {full_path}')

# Verify
for root, dirs, files in os.walk(base):
    relpath = os.path.relpath(root, base)
    print(f'  {relpath}/')

print('Done!')
