import shutil
import os
import json

# Copy the contents of apps/data-api/data and all of its descendant files and directories to dist/apps/web/browser/assets.
shutil.copytree(
    "apps/data-api/data", "dist/apps/web/browser/assets/data", dirs_exist_ok=True
)


# Copy the contents of apps/data-api/images and all of its descendant files and directories to dist/apps/web/browser/assets.
# Exclude apps/data-api/images/pages
def ignore_pages(dir, filenames):
    return ["pages"] if dir == "apps/data-api/images" else []


shutil.copytree(
    "apps/data-api/images",
    "dist/apps/web/browser/assets/images",
    dirs_exist_ok=True,
    ignore=ignore_pages,
)


def get_image_names(json_file):
    with open(json_file) as f:
        data = json.load(f)
    if isinstance(data, dict):
        for value in data.values():
            if isinstance(value, str) and (
                value.endswith(".jpg") or value.endswith(".jpeg")
            ):
                yield value
            elif isinstance(value, dict):
                for subvalue in value.values():
                    if isinstance(subvalue, str) and (
                        subvalue.endswith(".jpg") or subvalue.endswith(".jpeg")
                    ):
                        yield subvalue
    elif isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                for subitem in item.values():
                    if isinstance(subitem, str) and (
                        subitem.endswith(".jpg") or subitem.endswith(".jpeg")
                    ):
                        yield subitem


image_names = set()
for root, dirs, files in os.walk("apps/data-api/data"):
    for file in files:
        if file.endswith(".json"):
            image_names.update(get_image_names(os.path.join(root, file)))


for root, dirs, files in os.walk("apps/data-api/data"):
    for file in files:
        if file == "columns.json":
            with open(os.path.join(root, file)) as f:
                data = json.load(f)
                for item in data:
                    if 'facsimiles' in item:
                        for facsimile in item['facsimiles'].values():
                            if 'url' in facsimile:
                                image_names.add(facsimile['url'])


if not os.path.exists("dist/apps/web/browser/assets/images/pages"):
    os.makedirs("dist/apps/web/browser/assets/images/pages")


for image_name in image_names:
    source_path = os.path.join("apps/data-api/images/pages", image_name)
    destination_path = os.path.join(
        "dist/apps/web/browser/assets/images/pages", image_name
    )
    if os.path.exists(source_path):
        shutil.copy2(source_path, destination_path)
    else:
        print(f"Warning: {source_path} does not exist.")
