import json
import os
from setuptools import setup
import io

with open(os.path.join("dash_extendable_graph", "package.json")) as f:
    package = json.load(f)

package_name = package["name"].replace(" ", "_").replace("-", "_")

setup(
    name=package_name,
    version=package["version"],
    author=package["author"]["name"],
    author_email=package["author"]["email"],
    url=package["homepage"],
    packages=[package_name],
    include_package_data=True,
    license=package["license"],
    description=package["description"] if "description" in package else package_name,
    long_description=io.open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    install_requires=[],
    classifiers=[
        "Programming Language :: Python :: 3",
        "Framework :: Dash",
        "Framework :: Flask",
        "Environment :: Web Environment",
        "License :: OSI Approved :: MIT License",
        "Topic :: Scientific/Engineering :: Visualization",
    ],
)
