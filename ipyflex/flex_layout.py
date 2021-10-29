#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Trung Le.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from typing import Union
from typing import Dict as TypeDict
from typing import List as TypeList
from ipywidgets import Widget, widget_serialization, DOMWidget
from ipywidgets.widgets.trait_types import TypedTuple
from traitlets.traitlets import TraitType, Unicode, Instance, Dict
from ._frontend import module_name, module_version


class FlexLayout(DOMWidget):
    """TODO: Add docstring here"""

    _model_name = Unicode("FlexLayoutModel").tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode("FlexLayoutView").tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    # children = TypedTuple(
    #     trait=Instance(Widget), help="List of widget children"
    # ).tag(sync=True, **widget_serialization)
    children = Dict(
        key_trait=Unicode,
        value_trait=Instance(Widget),
        help="Dict of widget children",
    ).tag(sync=True, **widget_serialization)

    layout_config = Dict(
        {"borderLeft": False, "borderRight": False},
        help="Dict of layout configuration",
    ).tag(sync=True)

    def __init__(
        self,
        widgets: Union[TypeDict, TypeList],
        layout_config: TypeDict,
        **kwargs,
    ):
        if isinstance(widgets, dict):
            self.children = widgets
        else:
            self.children = {
                f"Widget {i}": widgets[i] for i in range(0, len(widgets))
            }
        self.layout_config = layout_config
        super().__init__(**kwargs)
