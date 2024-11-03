<h1 align="center">ipyflex</h1>

[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/trungleduc/ipyflex/main?urlpath=lab%2Ftree%2Fexamples) ![Build](https://github.com/trungleduc/ipyflex/actions/workflows/build.yml/badge.svg) [![Documentation Status](https://readthedocs.org/projects/ipyflex/badge/?version=latest)](http://ipyflex.readthedocs.io/?badge=latest) [![GitHub license](https://badgen.net/github/license/trungleduc/ipyflex)](https://github.com/trungleduc/ipyflex/blob/main/LICENSE) [![PyPI version](https://badge.fury.io/py/ipyflex.svg)](https://badge.fury.io/py/ipyflex) [![Conda Version](https://img.shields.io/conda/vn/conda-forge/ipyflex.svg)](https://anaconda.org/conda-forge/ipyflex)

<h2 align="center"> A WYSIWYG layout editor for Jupyter widgets </h1>

Based on the React library [FlexLayout](https://github.com/caplin/FlexLayout), ipyflex allows you to compose the sophisticated dashboard layouts from existing Jupyter widgets without coding. It supports multiple tabs, resizable cards, drag-and-drop layout, save dashboard template to disk, and many more.

## Example

### Dynamic layout

![Dynamic layout](./docs/source/images/ipyflex.gif)

### Widget factory

![Widget factory](./docs/source/images/ipyflex-factory.gif)

### Configurable header

https://user-images.githubusercontent.com/4451292/149482302-30579785-4d8e-4d50-9bcc-249bea4a9d95.mp4

### Stock indexes dashboard

![Stock indexes](./docs/source/images/ipyflex-stock2.gif)

## Documentation

You can read the documentation following this link: https://ipyflex.readthedocs.io

## Installation

You can install using `pip`:

```bash
pip install ipyflex
```

Or using `conda`:

```bash
conda install -c conda-forge  ipyflex
```

And if you use jupyterlab <= 2:

```bash
mamba install -c conda-forge jlpm
jupyter labextension install @jupyter-widgets/jupyterlab-manager ipyflex
```

## Development Installation

Create a dev environment:

```bash
conda create -n ipyflex-dev -c conda-forge nodejs jlpm python jupyterlab
conda activate ipyflex-dev
```

Install the python. This will also build the TS package.

```bash
pip install -e ".[test, examples]"
```

When developing your extensions, you need to manually enable your extensions with the
notebook / lab frontend. For lab, this is done by the command:

```
jupyter labextension develop --overwrite .
jlpm run build
```

For classic notebook, you need to run:

```
jupyter nbextension install --sys-prefix --symlink --overwrite --py ipyflex
jupyter nbextension enable --sys-prefix --py ipyflex
```

Note that the `--symlink` flag doesn't work on Windows, so you will here have to run
the `install` command every time that you rebuild your extension. For certain installations
you might also need another flag instead of `--sys-prefix`, but we won't cover the meaning
of those flags here.

### How to see your changes

#### Typescript:

If you use JupyterLab to develop then you can watch the source directory and run JupyterLab at the same time in different
terminals to watch for changes in the extension's source and automatically rebuild the widget.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

After a change wait for the build to finish and then refresh your browser and the changes should take effect.

#### Python:

If you make a change to the python code then you will need to restart the notebook kernel to have it take effect.

## Thanks

The following libraries / open-source projects were used or inspired in the development of ipyflex:

- [FlexLayout](https://github.com/caplin/FlexLayout)
- [CoSApp Lab](https://gitlab.com/cosapp/cosapp_lab)
