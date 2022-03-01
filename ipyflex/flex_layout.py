#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Trung Le.
# Distributed under the terms of the Modified BSD License.

import json
import os
from enum import Enum
from typing import Callable, Dict as TypeDict
from typing import List as TypeList
from typing import Union as TypeUnion

from ipywidgets import DOMWidget, Widget, widget_serialization
from traitlets.traitlets import (
    Bool,
    Dict,
    Instance,
    Unicode,
    List,
    Union,
    validate,
)

from ._frontend import module_name, module_version
from .utils import get_nonexistant_path, get_function_signature
import copy


class MESSAGE_ACTION(str, Enum):
    SAVE_TEMPLATE = 'save_template'
    UPDATE_CHILDREN = 'update_children'
    REQUEST_FACTORY = 'request_factory'
    RENDER_FACTORY = 'render_factory'
    RENDER_ERROR = 'render_error'
    ADD_WIDGET = 'add_widget'
    SAVE_TEMPLATE_FROM_PYTHON = 'save_template_from_python'
    LOAD_TEMPLATE_FROM_PYTHON = 'load_template_from_python'
    REGISTER_FRONTEND = 'register_frontend'


class FlexLayout(DOMWidget):

    RESERVED_NAME = {'Create new'}

    _model_name = Unicode('FlexLayoutModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('FlexLayoutView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    children = Dict(
        key_trait=Unicode,
        value_trait=Instance(Widget),
        help='Dict of widget children',
    ).tag(sync=True, **widget_serialization)

    widget_factories = Dict(
        key_trait=Unicode, value_trait=Dict, default_value={}
    ).tag(sync=True)

    placeholder_widget = List(trait=Unicode, default_value=[]).tag(sync=True)

    layout_config = Dict(
        {'borderLeft': False, 'borderRight': False, 'enableSection': False},
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

    editable = Bool(
        True, help='Flag to activate/deactivate edit mode', config=True
    ).tag(sync=True)

    header = Union(
        [Dict(), Bool()],
        help='Header configuration',
        default_value=False,
        config=True,
    ).tag(sync=True)

    @validate('header')
    def _valid_header(self, proposal):
        default_buttons = ['save', 'export', 'import']
        ret = proposal['value']
        if isinstance(ret, bool):
            if ret:
                ret = {'title': '', 'buttons': default_buttons}
            else:
                ret = {}
        elif isinstance(ret, dict):
            if 'buttons' not in ret:
                ret['buttons'] = default_buttons

        return ret

    def __init__(
        self,
        widgets: TypeUnion[TypeDict, TypeList] = [],
        factories: TypeDict[str, Callable] = {},
        **kwargs,
    ):
        super().__init__(**kwargs)

        self.uuid: str = None
        if isinstance(widgets, dict):
            self.children = widgets
        elif isinstance(widgets, list):
            self.children = {
                f'Widget {i}': widgets[i] for i in range(0, len(widgets))
            }
        else:
            raise TypeError('Invalid input!')
        children_set = set(self.children)
        factories_set = set(factories)
        if (
            len(self.RESERVED_NAME & children_set) > 0
            or len(self.RESERVED_NAME & factories_set) > 0
        ):
            raise KeyError(
                f'Please do not use widget name in reserved list: '
                f'{self.RESERVED_NAME}'
            )

        if len(children_set & factories_set) > 0:
            raise ValueError(
                'Please do not use a same name for both widget and factory'
            )
        factories_sig = {}
        for key, factory in factories.items():
            factories_sig[key] = get_function_signature(factory)

        self.widget_factories = factories_sig
        self.placeholder_widget = []
        self._factories = factories
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
        """Add widget to dashboard"""
        if not self.editable:
            self.log.warning('Widget is in readonly mode!')
            return
        if name in self.RESERVED_NAME:
            raise KeyError('Please do not use widget name in reserved list!')
        error = (
            lambda type: f'A {type} with the same name is already registered!'
        )
        if name in self.widget_factories:
            raise KeyError(error('factory'))
        if name in self.children:
            raise KeyError(error('widget'))
        if not isinstance(widget, Widget):
            raise TypeError(
                f'A widget is expected, got {type(widget)} instead'
            )

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
        elif action == MESSAGE_ACTION.REQUEST_FACTORY:
            factory_name = payload['factory_name']
            uuid = payload['uuid']
            if factory_name in self.widget_factories:
                if 'extraData' in payload:
                    params = payload['extraData']
                else:
                    params = {}
                try:
                    w_model = self._factories[factory_name](**params)
                    model_msg = widget_serialization['to_json'](w_model, None)
                    self.send(
                        {
                            'action': MESSAGE_ACTION.RENDER_FACTORY,
                            'payload': {'model_id': model_msg, 'uuid': uuid},
                        }
                    )
                except Exception as e:
                    self.send(
                        {
                            'action': MESSAGE_ACTION.RENDER_ERROR,
                            'payload': {'error_msg': str(e), 'uuid': uuid},
                        }
                    )

        elif action == MESSAGE_ACTION.ADD_WIDGET:
            widget_name = payload['name']
            old = copy.copy(self.placeholder_widget)
            if widget_name not in old:
                old.append(widget_name)
                self.placeholder_widget = old
            else:
                raise KeyError(
                    'A widget with the same name is already registered!'
                )

        elif action == MESSAGE_ACTION.REGISTER_FRONTEND:
            self.uuid = payload['uuid']

    def save_template(self, name: str) -> None:
        if self.uuid is not None:
            fileName = name.replace('.json', '') + '.json'
            self.send(
                {
                    'action': MESSAGE_ACTION.SAVE_TEMPLATE_FROM_PYTHON,
                    'payload': {'name': fileName, 'uuid': self.uuid},
                }
            )

    def load_template(self, path: str) -> None:
        if os.path.isfile(path):
            with open(path, 'r') as f:
                self.template_json = json.load(f)
                self.send(
                    {
                        'action': MESSAGE_ACTION.LOAD_TEMPLATE_FROM_PYTHON,
                        'payload': {
                            'template': self.template_json,
                            'uuid': self.uuid,
                        },
                    }
                )
        else:
            raise FileExistsError(f'{path} can not be found!')
