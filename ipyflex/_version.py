#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Trung Le.
# Distributed under the terms of the Modified BSD License.

version_info = (0, 2, 6, "", "")
post = ''
if len(version_info) > 3:
    post = ''.join(version_info[3:])
__version__ = '.'.join(map(str, version_info[0:3])) + post
