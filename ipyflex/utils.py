import os
import inspect
from typing import Callable, Dict


def get_nonexistant_path(fname_path) -> str:
    if not os.path.exists(fname_path):
        return fname_path
    filename, extension = os.path.splitext(fname_path)
    get_name = lambda i: f'{filename}-{i}{extension}'
    i = 1
    new_fname = get_name(i)
    while os.path.exists(new_fname):
        i += 1
        new_fname = get_name(i)
    return new_fname


def get_function_signature(f: Callable) -> Dict:
    sig = inspect.signature(f)

    params = sig.parameters
    ret = {}
    for key in sig.parameters:
        param = params.get(key)
        ret[key] = {
            'type': param.annotation if param.annotation != inspect._empty
            else None,
            'default': param.default
            if param.default != inspect._empty
            else None,
        }
    return ret
