#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Trung Le.
# Distributed under the terms of the Modified BSD License.

from .flex_layout import FlexLayout
from ._version import __version__

__all__ = ['FlexLayout', '__version__']


def _jupyter_labextension_paths():
    return [
        {
            'src': 'labextension',
            'dest': 'ipyflex',
        }
    ]


def _jupyter_nbextension_paths():
    return [
        {
            'section': 'notebook',
            'src': 'nbextension',
            'dest': 'ipyflex',
            'require': 'ipyflex/extension',
        }
    ]
