#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Trung Le.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

import json
import os
from enum import Enum
from typing import Dict as TypeDict
from typing import List as TypeList
from typing import Union

from ipywidgets import DOMWidget, Widget, widget_serialization
from traitlets.traitlets import Bool, Dict, Instance, Int, Unicode

from ._frontend import module_name, module_version
from .utils import get_nonexistant_path
import copy


class MESSAGE_ACTION(str, Enum):
    SAVE_TEMPLATE = 'save_template'
    UPDATE_CHILDREN = 'update_children'


class FlexLayout(DOMWidget):
    """TODO: Add docstring here"""

    _model_name = Unicode('FlexLayoutModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('FlexLayoutView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    # children = TypedTuple(
    #     trait=Instance(Widget), help="List of widget children"
    # ).tag(sync=True, **widget_serialization)
    children = Dict(
        key_trait=Unicode,
        value_trait=Instance(Widget),
        help='Dict of widget children',
    ).tag(sync=True, **widget_serialization)

    layout_config = Dict(
        {'borderLeft': False, 'borderRight': False},
        help='Layout configuration',
    ).tag(sync=True)

    style = Dict(
        {},
        help='Style configuration',
    ).tag(sync=True)

    template = Unicode(
        None, help='Path to template json file.', allow_none=True
    ).tag(sync=True)

    template_json = Dict(
        None, help='Template configuration', allow_none=True
    ).tag(sync=True)

    editable = Bool(True, help='Flag to activate/deactivate edit mode').tag(
        sync=True
    )

    def __init__(
        self,
        widgets: Union[TypeDict, TypeList] = [],
        # layout_config: TypeDict,
        **kwargs,
    ):
        super().__init__(**kwargs)

        if isinstance(widgets, dict):
            self.children = widgets
        elif isinstance(widgets, list):
            self.children = {
                f'Widget {i}': widgets[i] for i in range(0, len(widgets))
            }
        else:
            raise TypeError('Invalid input!')

        self.template_json = None
        if self.template is not None:
            try:
                with open(self.template, 'r') as f:
                    self.template_json = json.load(f)
            except FileNotFoundError:
                self.log.warning(
                    f'Failed to read {self.template}! Using default template.'
                )
                self.template_json = None
        self.on_msg(self._handle_frontend_msg)

    def add(self, name: str, widget: Widget) -> None:
        if not self.editable:
            self.log.warning('Widget is in readonly mode!')
            return
        old = copy.copy(self.children)
        old[name] = widget
        self.children = old
        self.send(
            {
                'action': MESSAGE_ACTION.UPDATE_CHILDREN,
                'payload': {'name': name},
            }
        )

    def _handle_frontend_msg(
        self, model: 'FlexLayout', msg: Dict, buffers: TypeList
    ) -> None:
        action = msg.get('action')
        payload = msg.get('payload', None)
        if action == MESSAGE_ACTION.SAVE_TEMPLATE:
            file_name = str(payload.get('file_name'))
            json_data = payload.get('json_data')
            if not file_name.endswith('.json'):
                file_name += '.json'
            if file_name != self.template:
                file_path = get_nonexistant_path(
                    os.path.join(os.getcwd(), file_name)
                )
            else:
                file_path = self.template
            with open(file_path, 'w') as f:
                json.dump(json_data, f)
            self.template = file_path
