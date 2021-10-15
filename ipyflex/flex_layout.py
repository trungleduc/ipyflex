#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Trung Le.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from ipywidgets import Widget, widget_serialization, DOMWidget
from ipywidgets.widgets.trait_types import TypedTuple
from traitlets import Unicode, Instance
from ._frontend import module_name, module_version


class FlexLayout(DOMWidget):
    """TODO: Add docstring here"""

    _model_name = Unicode("FlexLayoutModel").tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode("FlexLayoutView").tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    children = TypedTuple(
        trait=Instance(Widget), help="List of widget children"
    ).tag(sync=True, **widget_serialization)
    value = Unicode("Hello World").tag(sync=True)
