import os


def get_nonexistant_path(fname_path):
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
