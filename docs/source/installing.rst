
.. _installation:

Installation
============


The simplest way to install ipyflex is via pip::

    pip install ipyflex

or via conda::

    conda install -c conda-forge  ipyflex


- If you installed via pip, and notebook version < 5.3, you will also have to install / configure the front-end extension as well. If you are using classic notebook (as opposed to Jupyterlab), run::

    jupyter nbextension install [--sys-prefix / --user / --system] --py ipyflex
    jupyter nbextension enable [--sys-prefix / --user / --system] --py ipyflex

with the `appropriate flag`_. If you are installing using conda, these commands should be unnecessary, but If
you need to run them the commands should be the same (just make sure you choose the
`--sys-prefix` flag).

- If you are using Jupyterlab <= 2, install the extension with::

    conda install -c conda-forge yarn
    jupyter labextension install @jupyter-widgets/jupyterlab-manager ipyflex





.. links

.. _`appropriate flag`: https://jupyter-notebook.readthedocs.io/en/stable/extending/frontend_extensions.html#installing-and-enabling-extensions
