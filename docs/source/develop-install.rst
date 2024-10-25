
Developer install
=================


To install a developer version of ipyflex, you will first need to clone the repository::

    git clone https://github.com/trungleduc/ipyflex
    cd ipyflex

Create a dev environment::

    conda create -n ipyflex-dev -c conda-forge nodejs yarn python jupyterlab
    conda activate ipyflex-dev


Install the python. This will also build the TS package::

    pip install -e ".[test, examples]"


When developing your extensions, you need to manually enable your extensions with the notebook / lab frontend. For lab, this is done by the command::

    jupyter labextension develop --overwrite .
    jlpm run build

For classic notebook, you need to run::

    jupyter nbextension install --sys-prefix --symlink --overwrite --py ipyflex
    jupyter nbextension enable --sys-prefix --py ipyflex

Note that the `--symlink` flag doesn't work on Windows, so you will here have to run the `install` command every time that you rebuild your extension. For certain installations you might also need another flag instead of `--sys-prefix`, but we won't cover the meaning of those flags here.

How to see your changes
----------------------------
Typescript:
****************
If you use JupyterLab to develop then you can watch the source directory and run JupyterLab at the same time in different
terminals to watch for changes in the extension's source and automatically rebuild the widget::

    # Watch the source directory in one terminal, automatically rebuilding when needed
    jlpm run watch
    # Run JupyterLab in another terminal
    jupyter lab


After a change wait for the build to finish and then refresh your browser and the changes should take effect.

Python:
***********
If you make a change to the python code then you will need to restart the notebook kernel to have it take effect.



.. links

.. _`appropriate flag`: https://jupyter-notebook.readthedocs.io/en/stable/extending/frontend_extensions.html#installing-and-enabling-extensions
